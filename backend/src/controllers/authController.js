const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'change_me';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign({ userId }, secret, { expiresIn });
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  profileType: user.profileType,
  workingRole: user.workingRole,
  studentStatus: user.studentStatus,
  onboardingCompleted: user.onboardingCompleted,
  linkedinUrl: user.linkedinUrl,
  lastSeen: user.lastSeen,
  isOnline: user.isOnline,
  avatar: user.avatar,
});

const validateOnboardingPayload = ({ profileType, workingRole, studentStatus }) => {
  if (!['student', 'working_professional'].includes(profileType)) {
    return 'Profile type must be either student or working_professional';
  }

  if (profileType === 'working_professional') {
    if (!['hr', 'employee'].includes(workingRole)) {
      return 'Working role must be either hr or employee for working_professional';
    }
    if (studentStatus) {
      return 'studentStatus should not be provided for working_professional';
    }
  }

  if (profileType === 'student') {
    if (!['placed', 'unplaced'].includes(studentStatus)) {
      return 'Student status must be either placed or unplaced for student';
    }
    if (workingRole) {
      return 'workingRole should not be provided for student';
    }
  }

  return null;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return next(error);
  }
};

const saveOnboarding = async (req, res, next) => {
  try {
    const { profileType, workingRole, studentStatus } = req.body;

    const validationMessage = validateOnboardingPayload({ profileType, workingRole, studentStatus });
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileType = profileType;
    user.workingRole = profileType === 'working_professional' ? workingRole : null;
    user.studentStatus = profileType === 'student' ? studentStatus : null;
    user.onboardingCompleted = true;

    await user.save();

    return res.status(200).json({
      message: 'Onboarding details saved successfully',
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { search } = req.query;
    const filter = { onboardingCompleted: true, _id: { $ne: req.userId } };

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ name: 1 })
      .limit(100);

    return res.status(200).json({
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { linkedinUrl } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl || null;

    await user.save();
    return res.status(200).json({ message: 'Profile updated', user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  saveOnboarding,
  getAllUsers,
  updateProfile,
};
