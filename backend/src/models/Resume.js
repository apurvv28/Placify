const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    template: {
        type: String,
        required: true,
        default: 'Modern'
    },
    professionalSummary: {
        type: String,
        default: ''
    },
    personalInfo: {
        type: Object,
        default: {}
    },
    languages: {
        type: Array,
        default: []
    },
    experience: {
        type: Array,
        default: []
    },
    skills: {
        type: Array,
        default: []
    },
    projects: {
        type: Array,
        default: []
    },
    education: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
