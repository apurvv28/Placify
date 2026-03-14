const Resume = require('../models/Resume');


exports.getResume = async (req, res, next) => {
    try {
        const resume = await Resume.findOne({ user: req.userId });
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

        let resume = await Resume.findOne({ user: req.userId });

        if (resume) {
            resume.template = template || resume.template;
            if (professionalSummary !== undefined) resume.professionalSummary = professionalSummary;
            if (personalInfo !== undefined) resume.personalInfo = personalInfo;
            if (languages !== undefined) resume.languages = languages;
            if (experience !== undefined) resume.experience = experience;
            if (skills !== undefined) resume.skills = skills;
            if (projects !== undefined) resume.projects = projects;
            if (education !== undefined) resume.education = education;
            await resume.save();
        } else {
            resume = await Resume.create({
                user: req.userId,
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
        const resume = await Resume.findOneAndDelete({ user: req.userId });
        if (!resume) {
            return res.status(404).json({ message: 'Resume not found' });
        }
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

    const resume = await Resume.create({
      user: req.userId,
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
    const resumes = await Resume.find().populate('user', 'name placementStatus').sort({ createdAt: -1 });
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
