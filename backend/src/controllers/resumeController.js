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
        const { template, professionalSummary, personalInfo, languages, experience, skills, projects, education } = req.body;

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
