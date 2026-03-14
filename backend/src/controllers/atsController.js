const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Groq = require('groq-sdk');
const { verifyLinks, formatVerificationForPrompt } = require('../utils/linkVerifier');

function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY is not configured. Add your key to backend/.env and restart the server.');
  }
  return new Groq({ apiKey: key });
}

const ATS_SYSTEM_PROMPT = `You are an ATS Resume Analyzer module embedded in a hiring workflow. Evaluate the provided resume against standard Applicant Tracking System criteria and return ONLY a single valid JSON object — no markdown, no preamble, no text outside the JSON.

INPUT HANDLING:
- If a job description is provided: extract its keywords and compare against the resume.
- If no job description is provided: infer the role family from the resume and use common ATS keywords for that role family (e.g., Software Engineer, Data Analyst, Marketing Manager) as the comparison baseline. Note the inferred role in the output.

OUTPUT — return exactly this JSON structure:

{
  "score": <integer 0–100>,
  "scoreRationale": "<2–3 sentences explaining the score in plain language>",
  "detectedRole": "<inferred job family if no JD provided, else target role from JD>",

  "sectionNotes": {
    "header":          { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" },
    "summary":         { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" },
    "experience":      { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" },
    "education":       { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" },
    "skills":          { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" },
    "certifications":  { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" },
    "projects":        { "status": "pass|warn|fail", "note": "<what was found>", "fix": "<concrete fix if needed>" }
  },

  "keywordMatch": {
    "matched":  ["<keyword>", "..."],
    "partial":  [{ "keyword": "<term>", "suggestion": "<how to strengthen it in resume>" }],
    "missing":  ["<keyword>", "..."],
    "density":  "<brief assessment of keyword frequency — too sparse, balanced, or overstuffed>"
  },

  "formattingIssues": [
    {
      "issue": "<issue label>",
      "severity": "high|medium|low",
      "detail": "<plain-language explanation of why this breaks ATS parsing>",
      "fix": "<concrete corrective action>"
    }
  ],

  "improvementChecklist": [
    {
      "priority": "high|medium|low",
      "action": "<specific, actionable edit — one task per item>",
      "example": "<optional before/after snippet>"
    }
  ],

  "nextSteps": "<2–4 sentences summarizing the top 2 priorities the candidate should address first>"
}

SCORING RUBRIC (internal — do not expose in output):
- Header completeness & standard format:     10 pts
- Summary relevance & keyword inclusion:     10 pts
- Experience: action verbs, quantification:  20 pts
- Keyword match rate vs. JD or role family:  25 pts
- Formatting: ATS-parseable, no tables/graphics/columns: 20 pts
- Education & certifications present:        10 pts
- Overall length & structure appropriateness: 5 pts

FORMATTING RULES (check for all of these):
- Tables, text boxes, columns → flag high severity
- Headers/footers with contact info → flag high severity
- Non-standard section labels → flag medium
- Graphics, icons, logos → flag high severity
- Unusual Unicode characters or symbols (★ ● ◆) → flag medium
- Fonts other than Arial, Calibri, Garamond, Times New Roman → flag low
- Missing standard sections (Summary, Skills) → flag medium

LANGUAGE RULES:
- Write all notes, fixes, and suggestions in plain English for non-technical readers.
- Keep each field concise — notes under 2 sentences, fixes under 3 sentences.
- Never fabricate keywords, dates, companies, or metrics not present in the resume.
- Mark any claim you cannot verify from the resume text as "[not found in resume]".`;

async function extractText(file) {
  const mime = file.mimetype;
  if (mime === 'application/pdf') {
    const data = await pdfParse(file.buffer);
    return data.text;
  }
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return result.value;
  }
  throw new Error('Unsupported file type');
}

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No resume file uploaded.' });
    }

    // Extract text from the uploaded file
    let resumeText;
    try {
      resumeText = await extractText(req.file);
    } catch (err) {
      return res.status(422).json({ success: false, error: `Failed to parse file: ${err.message}` });
    }

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(422).json({ success: false, error: 'Resume appears to be empty or could not be read. Please try a text-based PDF or DOCX.' });
    }

    const jobDescription = (req.body.jobDescription || '').trim();

    console.log('[ATS] Running link verification...');
    const linkVerification = await verifyLinks(resumeText, req.file);
    const verificationSummary = formatVerificationForPrompt(linkVerification);
    console.log(`[ATS] Verified ${linkVerification.length} links.`);

    const baseContext = jobDescription
      ? `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME TEXT:\n${resumeText}`
      : `NO JOB DESCRIPTION PROVIDED — please infer the role family.\n\nRESUME TEXT:\n${resumeText}`;

    const userMessage = verificationSummary
      ? `${baseContext}\n${verificationSummary}`
      : baseContext;

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: ATS_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const rawContent = completion.choices[0]?.message?.content || '';

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ success: false, error: 'AI returned an unexpected response format. Please try again.' });
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      return res.status(500).json({ success: false, error: 'Failed to parse AI response. Please try again.' });
    }

    return res.status(200).json({ success: true, analysis, linkVerification });
  } catch (err) {
    console.error('ATS Analyzer error:', err);
    if (err.status === 401) {
      return res.status(500).json({ success: false, error: 'Invalid Groq API key. Please check your .env file.' });
    }
    if (err.status === 429) {
      return res.status(429).json({ success: false, error: 'Groq rate limit reached. Please wait a moment and try again.' });
    }
    return res.status(500).json({ success: false, error: 'Analysis failed. Please try again.' });
  }
};

module.exports = { analyzeResume };
