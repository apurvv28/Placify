const Resume = require('../models/Resume');
const fs = require('fs');
const path = require('path');

const createResume = async (req, res) => {
  try {
    const { name, summary, skills, company, ctc, isInternship, year, stipend } = req.body;
    
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
  createResume,
  getResumes
};
