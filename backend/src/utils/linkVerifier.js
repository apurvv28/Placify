'use strict';

const https = require('https');
const http = require('http');
const JSZip = require('jszip');

const CERT_DOMAINS = [
  'coursera.org', 'udemy.com', 'credly.com', 'credential.net',
  'hackerrank.com', 'leetcode.com', 'badgr.com', 'acclaim.com',
  'linkedin.com/learning', 'edx.org', 'pluralsight.com', 'udacity.com',
  'aws.amazon.com/certification', 'cloud.google.com/certification',
  'microsoft.com/learning', 'oracle.com/education',
];

const URL_REGEX = /https?:\/\/[^\s\)\]\}"'<>,]+/gi;

function categorize(url) {
  const lower = url.toLowerCase();
  if (/github\.com\/[^/\s]+\/[^/\s]+/.test(lower)) return 'github_repo';
  if (/github\.com/.test(lower)) return 'github_profile';
  if (/linkedin\.com\/in\//.test(lower)) return 'linkedin';
  if (CERT_DOMAINS.some((d) => lower.includes(d))) return 'certification';
  return 'portfolio';
}

function cleanUrl(u) {
  return u.replace(/[.,;:'")\]]+$/, '').trim();
}

// ─── Source 1: Plain-text URL extraction ─────────────────────────────────────

function extractFromText(text) {
  const raw = text.match(URL_REGEX) || [];
  return raw.map(cleanUrl).filter(Boolean);
}

// ─── Source 2: PDF annotation /URI entries ───────────────────────────────────
//
// PDF files store hyperlinks as Link Annotation objects in the PDF object
// stream. Each looks like:  /URI (https://example.com)  or  /URI<...hex...>
// We scan the raw Buffer directly — no extra library needed.

function extractFromPDFBuffer(buffer) {
  const urls = [];
  const str = buffer.toString('latin1'); // use latin1 so byte values map 1:1

  // Pattern 1: /URI (https://...)
  const parenRe = /\/URI\s*\(([^)]+)\)/gi;
  let m;
  while ((m = parenRe.exec(str)) !== null) {
    const u = m[1].trim();
    if (u.startsWith('http')) urls.push(u);
  }

  // Pattern 2: /URI<hex-encoded> — some PDF generators hex-encode the URI
  const hexRe = /\/URI\s*<([0-9A-Fa-f]+)>/gi;
  while ((m = hexRe.exec(str)) !== null) {
    try {
      const decoded = Buffer.from(m[1], 'hex').toString('utf8');
      if (decoded.startsWith('http')) urls.push(decoded.trim());
    } catch { /* skip */ }
  }

  // Pattern 3: /A << /URI … >> style (older Acrobat)
  const aRe = /\/A\s*<<[^>]*\/URI\s*\(([^)]+)\)/gi;
  while ((m = aRe.exec(str)) !== null) {
    const u = m[1].trim();
    if (u.startsWith('http')) urls.push(u);
  }

  return urls;
}

// ─── Source 3: DOCX relationship XML ─────────────────────────────────────────
//
// DOCX files are ZIP archives. Hyperlinks are stored as <Relationship> entries
// in word/_rels/document.xml.rels with Type="…/hyperlink".
// We unzip and regex-parse that XML — no DOM parser needed.

async function extractFromDOCXBuffer(buffer) {
  const urls = [];
  try {
    const zip = await JSZip.loadAsync(buffer);

    // Find all .rels files inside the word/ folder (covers headers, footers, etc.)
    const relFiles = Object.keys(zip.files).filter(
      (f) => f.startsWith('word/') && f.endsWith('.rels')
    );
    // Also include the root _rels/
    Object.keys(zip.files)
      .filter((f) => f.match(/^_rels\/.*\.rels$/))
      .forEach((f) => relFiles.push(f));

    for (const relFile of relFiles) {
      const xml = await zip.files[relFile].async('text');
      // Match: Type="…/hyperlink" … Target="https://…"
      // Or reversed attribute order
      const relRe = /<Relationship[^>]+Type="[^"]*\/hyperlink"[^>]+Target="([^"]+)"/gi;
      const relRe2 = /<Relationship[^>]+Target="([^"]+)"[^>]+Type="[^"]*\/hyperlink"/gi;
      let m;
      while ((m = relRe.exec(xml)) !== null) {
        if (m[1].startsWith('http')) urls.push(m[1].trim());
      }
      while ((m = relRe2.exec(xml)) !== null) {
        if (m[1].startsWith('http')) urls.push(m[1].trim());
      }
    }
  } catch (err) {
    console.warn('[linkVerifier] DOCX unzip failed:', err.message);
  }
  return urls;
}

// ─── Combine & deduplicate ────────────────────────────────────────────────────

async function extractAllLinks(resumeText, file) {
  const rawUrls = new Set();

  // Always try plain-text extraction
  extractFromText(resumeText).forEach((u) => rawUrls.add(u));

  if (file && file.buffer) {
    const mime = file.mimetype;
    if (mime === 'application/pdf') {
      extractFromPDFBuffer(file.buffer).forEach((u) => rawUrls.add(cleanUrl(u)));
    } else if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const docxUrls = await extractFromDOCXBuffer(file.buffer);
      docxUrls.forEach((u) => rawUrls.add(cleanUrl(u)));
    }
  }

  // Convert to categorized objects, filter obviously invalid
  return [...rawUrls]
    .filter((u) => {
      try { new URL(u); return true; } catch { return false; }
    })
    .map((url) => ({ url, category: categorize(url) }));
}

// ─── GitHub API check ─────────────────────────────────────────────────────────

function githubRepoCheck(url) {
  return new Promise((resolve) => {
    const match = url.match(/github\.com\/([^/\s]+)\/([^/\s?#]+)/i);
    if (!match) return resolve({ status: 'dead', meta: null });

    const [, owner, repo] = match;
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo.replace(/\.git$/, '')}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Placify-ATS-Analyzer/1.0',
        Accept: 'application/vnd.github.v3+json',
      },
      timeout: 8000,
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(body);
            resolve({
              status: 'live',
              httpStatus: 200,
              meta: {
                repoName: data.full_name,
                description: data.description || '',
                stars: data.stargazers_count,
                forks: data.forks_count,
                language: data.language || 'N/A',
                lastPushed: data.pushed_at ? data.pushed_at.split('T')[0] : null,
                isPrivate: data.private,
              },
            });
          } catch {
            resolve({ status: 'live', httpStatus: 200, meta: null });
          }
        } else if (res.statusCode === 404) {
          resolve({ status: 'dead', httpStatus: 404, meta: null });
        } else if (res.statusCode === 403) {
          resolve({ status: 'rate_limited', httpStatus: 403, meta: null });
        } else {
          resolve({ status: 'dead', httpStatus: res.statusCode, meta: null });
        }
      });
    });

    req.on('timeout', () => { req.destroy(); resolve({ status: 'timeout', meta: null }); });
    req.on('error', () => resolve({ status: 'dead', meta: null }));
    req.end();
  });
}

// ─── Generic HTTP HEAD check ──────────────────────────────────────────────────

function headCheck(rawUrl) {
  return new Promise((resolve) => {
    let parsed;
    try { parsed = new URL(rawUrl); } catch { return resolve({ status: 'dead', httpStatus: null }); }

    const lib = parsed.protocol === 'https:' ? https : http;
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
      path: parsed.pathname + parsed.search,
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Placify-ATS-Bot/1.0)' },
      timeout: 6000,
    };

    const req = lib.request(options, (res) => {
      const code = res.statusCode;
      res.resume();
      if (code >= 200 && code < 400) {
        resolve({ status: 'live', httpStatus: code });
      } else if (code === 403 || code === 405) {
        // Server is alive but blocks bots — treat as live
        resolve({ status: 'live', httpStatus: code });
      } else {
        resolve({ status: 'dead', httpStatus: code });
      }
    });

    req.on('timeout', () => { req.destroy(); resolve({ status: 'timeout', httpStatus: null }); });
    req.on('error', () => resolve({ status: 'dead', httpStatus: null }));
    req.end();
  });
}

// ─── Main entry ───────────────────────────────────────────────────────────────

async function verifyLinks(resumeText, file) {
  const links = await extractAllLinks(resumeText, file);

  console.log(`[linkVerifier] Found ${links.length} unique links (text + embedded)`);
  if (links.length === 0) return [];

  const results = await Promise.all(
    links.map(async ({ url, category }) => {
      const verification =
        category === 'github_repo'
          ? await githubRepoCheck(url)
          : await headCheck(url);
      return { url, category, ...verification };
    })
  );

  return results;
}

// ─── Format for AI prompt ─────────────────────────────────────────────────────

function formatVerificationForPrompt(results) {
  if (!results || results.length === 0) return '';

  const lines = results.map((r) => {
    const statusIcon =
      r.status === 'live' ? '✅ LIVE'
      : r.status === 'timeout' ? '⏱ TIMEOUT'
      : r.status === 'rate_limited' ? '⚠ RATE-LIMITED'
      : '❌ DEAD';
    const httpStr = r.httpStatus ? ` (HTTP ${r.httpStatus})` : '';
    let meta = '';
    if (r.meta) {
      const m = r.meta;
      if (m.repoName) meta = ` | Repo: ${m.repoName}, ⭐ ${m.stars}, Lang: ${m.language}, Last pushed: ${m.lastPushed || 'N/A'}, Private: ${m.isPrivate}`;
      if (m.description) meta += `, Desc: "${m.description.slice(0, 80)}"`;
    }
    return `  - [${r.category}] ${r.url} → ${statusIcon}${httpStr}${meta}`;
  });

  return `\nLINK VERIFICATION RESULTS (text-visible + embedded hyperlinks — verified live):\n${lines.join('\n')}\n\nIMPORTANT: Dead or timed-out links for certifications, project repos, or LinkedIn profiles should lower the candidate's score and be flagged in improvementChecklist.\n`;
}

module.exports = { verifyLinks, formatVerificationForPrompt };
