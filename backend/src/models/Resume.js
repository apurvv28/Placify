const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  skills: {
    type: [String],
    required: true
  },
  company: {
    type: String,
    required: true
  },
  ctc: {
    type: String,
    required: true
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
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
