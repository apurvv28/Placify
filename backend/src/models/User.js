const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    profileType: {
      type: String,
      enum: ['student', 'working_professional'],
      default: null,
    },
    workingRole: {
      type: String,
      enum: ['hr', 'employee'],
      default: null,
    },
    studentStatus: {
      type: String,
      enum: ['placed', 'unplaced'],
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
