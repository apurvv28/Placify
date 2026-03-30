const ResumeRepository = require('../repositories/ResumeRepository');
const UserRepository = require('../repositories/UserRepository');

const resumeRepo = new ResumeRepository();
const userRepo = new UserRepository();


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

const fs = require('fs');
const path = require('path');

const createResume = async (req, res) => {
  try {
    const { name, summary, skills, company, ctc, isInternship, year, stipend } = req.body || {};
    
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a resume file' });
    }

    // Process skills if it comes as a string (comma separated)
    let processedSkills = skills;
    if (typeof skills === 'string') {
      processedSkills = skills.split(',').map(skill => skill.trim());
    }

    const fileUrl = `/uploads/${req.file.filename}`;

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

module.exports = {
  getResume: exports.getResume,
  saveResume: exports.saveResume,
  clearResume: exports.clearResume,
  createResume,
  getResumes
};
