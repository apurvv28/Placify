const ResumeRepository = require('../repositories/ResumeRepository');
const UserRepository = require('../repositories/UserRepository');
const path = require('path');
const { isS3ResumeStorageEnabled, uploadResumeBuffer } = require('../config/s3');

const resumeRepo = new ResumeRepository();
const userRepo = new UserRepository();

const GROQ_CHAT_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_ATS_MODEL = process.env.GROQ_ATS_MODEL || 'llama-3.3-70b-versatile';

const buildSummaryPrompt = ({ personalInfo, currentSummary, experience, skills }) => {
  const skillText = Array.isArray(skills)
    ? skills.filter(Boolean).slice(0, 12).join(', ')
    : '';

  const experienceText = Array.isArray(experience)
    ? experience
        .filter((item) => item && (item.role || item.company || item.description))
        .slice(0, 4)
        .map((item) => {
          const role = item.role || 'Role';
          const company = item.company || 'Company';
          const desc = item.description || '';
          return `${role} at ${company}: ${desc}`.trim();
        })
        .join('\n- ')
    : '';

  return [
    'Generate a professional resume summary in 3-4 lines.',
    'Keep tone professional, concise, and ATS-friendly.',
    'Use measurable impact language when possible.',
    'Return ONLY plain text summary (no markdown, no bullets, no headings).',
    '',
    `Candidate Name: ${personalInfo?.name || ''}`,
    `Current Summary: ${currentSummary || ''}`,
    `Top Skills: ${skillText || '[not provided]'}`,
    `Experience Highlights:\n- ${experienceText || '[not provided]'}`,
  ].join('\n');
};

const suggestProfessionalSummary = async (req, res) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey || apiKey === 'your_groq_api_key_here') {
      return res.status(500).json({ message: 'GROQ_API_KEY is not configured on the server.' });
    }

    const { personalInfo = {}, professionalSummary = '', experience = [], skills = [] } = req.body || {};

    const payload = {
      model: GROQ_ATS_MODEL,
      temperature: 0.2,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content:
            'You are a resume writing assistant. Write concise, ATS-friendly professional summaries tailored to candidate data.',
        },
        {
          role: 'user',
          content: buildSummaryPrompt({
            personalInfo,
            currentSummary: professionalSummary,
            experience,
            skills,
          }),
        },
      ],
    };

    const response = await fetch(GROQ_CHAT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const suggestion = String(data?.choices?.[0]?.message?.content || '').trim();

    if (!suggestion) {
      return res.status(500).json({ message: 'AI did not return a summary suggestion.' });
    }

    return res.status(200).json({ suggestion });
  } catch (error) {
    console.error('Professional summary suggestion error:', error);
    return res.status(500).json({ message: 'Failed to generate professional summary suggestion.' });
  }
};


exports.getResume = async (req, res, next) => {
    try {
    const { items } = await resumeRepo.findByUserId(req.userId, 100);
    const resume = items.find((r) => r.hasFile === '0') || items[0];
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
        return res.status(200).json(resume);
    } catch (error) {
        return next(error);
    }
};

exports.saveResume = async (req, res, next) => {
    try {
        const { template, professionalSummary, personalInfo, languages, experience, skills, projects, education } = req.body || {};

    const { items } = await resumeRepo.findByUserId(req.userId, 100);
    let resume = items.find((r) => r.hasFile === '0');

        if (resume) {
      resume = await resumeRepo.update(resume.resumeId, {
        template: template || resume.template,
        professionalSummary: professionalSummary !== undefined ? professionalSummary : resume.professionalSummary,
        personalInfo: personalInfo !== undefined ? personalInfo : resume.personalInfo,
        languages: languages !== undefined ? languages : resume.languages,
        experience: experience !== undefined ? experience : resume.experience,
        skills: skills !== undefined ? skills : resume.skills,
        projects: projects !== undefined ? projects : resume.projects,
        education: education !== undefined ? education : resume.education,
        hasFile: '0',
      });
        } else {
      resume = await resumeRepo.create({
        userId: req.userId,
                template: template || 'Modern',
                professionalSummary: professionalSummary || '',
                personalInfo: personalInfo || {},
                languages: languages || [],
                experience: experience || [],
                skills: skills || [],
                projects: projects || [],
                education: education || []
            });
        }

        return res.status(200).json(resume);
    } catch (error) {
        return next(error);
    }
};

exports.clearResume = async (req, res, next) => {
    try {
    const { items } = await resumeRepo.findByUserId(req.userId, 100);
    if (!items.length) {
            return res.status(404).json({ message: 'Resume not found' });
        }

    await Promise.all(items.map((r) => resumeRepo.delete(r.resumeId)));
        return res.status(200).json({ message: 'Resume cleared successfully' });
    } catch (error) {
        return next(error);
    }
};

const createResume = async (req, res) => {
  try {
    const { name, summary, skills, company, ctc, isInternship, year, stipend } = req.body || {};
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    if (!isS3ResumeStorageEnabled()) {
      return res.status(500).json({ message: 'S3 resume storage is not configured. Set S3_RESUME_BUCKET.' });
    }

    // Process skills if it comes as a string (comma separated)
    let processedSkills = skills;
    if (typeof skills === 'string') {
      processedSkills = skills.split(',').map(skill => skill.trim());
    }

    const ext = path.extname(req.file.originalname || '').toLowerCase();
    const safeExt = ext || '.bin';
    const filename = `resume-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`;

    await uploadResumeBuffer({
      filename,
      buffer: req.file.buffer,
      contentType: req.file.mimetype,
    });

    const fileUrl = `/uploads/${filename}`;

    const resume = await resumeRepo.create({
      userId: req.userId,
      name,
      summary,
      skills: processedSkills,
      company,
      ctc,
      isInternship: isInternship === 'true' || isInternship === true,
      year,
      stipend,
      fileUrl
    });

    res.status(201).json({ message: 'Resume uploaded successfully', resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

const getResumes = async (req, res) => {
  try {
    const { items } = await resumeRepo.findByHasFile('1', 200);
    const resumes = await Promise.all(items.map(async (r) => {
      const user = r.userId ? await userRepo.findById(r.userId) : null;
      return {
        ...r,
        user: user ? { userId: user.userId, name: user.name } : null,
      };
    }));
    res.json({ resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const viewResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const resume = await resumeRepo.incrementViews(resumeId);
    res.json({ message: 'View recorded', resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

const likeResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const result = await resumeRepo.toggleLike(resumeId, req.userId);
    res.json({
      message: result.isLiking ? 'Resume liked' : 'Resume unliked',
      resume: result,
    });
  } catch (error) {
    console.error(error);
    if (error.message === 'Resume not found') {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }
    const resume = await resumeRepo.addComment(resumeId, req.userId, text.trim());
    res.status(201).json({ message: 'Comment added', resume });
  } catch (error) {
    console.error(error);
    if (error.message === 'Resume not found') {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { resumeId, commentId } = req.params;
    const resume = await resumeRepo.deleteComment(resumeId, commentId);
    res.json({ message: 'Comment deleted', resume });
  } catch (error) {
    console.error(error);
    if (error.message === 'Resume not found') {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getResume: exports.getResume,
  saveResume: exports.saveResume,
  clearResume: exports.clearResume,
  suggestProfessionalSummary,
  createResume,
  getResumes,
  viewResume,
  likeResume,
  addComment,
  deleteComment,
};
