const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // ---- Resume Builder Fields ----
    template: {
        type: String,
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
    projects: {
        type: Array,
        default: []
    },
    education: {
        type: Array,
        default: []
    },
    
    // ---- Placed Uploads Fields ----
    name: {
      type: String
    },
    summary: {
      type: String
    },
    company: {
      type: String
    },
    ctc: {
      type: String
    },
    isInternship: {
      type: Boolean,
      default: false
    },
    year: {
      type: String
    },
    stipend: {
      type: String
    },
    fileUrl: {
      type: String
    },

    // ---- Shared / Common ----
    skills: {
        type: Array,
        default: []
    }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
