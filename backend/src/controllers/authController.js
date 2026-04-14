const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserRepository = require('../repositories/UserRepository');

const userRepo = new UserRepository();

const normalizeExpiresIn = (value) => {
  if (typeof value !== 'string') return '7d';

  let normalized = value.trim();
  if (!normalized) return '7d';

  // Accept values accidentally saved as quoted strings in env providers.
  normalized = normalized.replace(/^['\"]|['\"]$/g, '');

  return normalized || '7d';
};

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'change_me';
  const expiresIn = normalizeExpiresIn(process.env.JWT_EXPIRES_IN || '7d');

  return jwt.sign({ userId }, secret, { expiresIn });
};

const getEnv = (name, fallback = '') => {
  const value = process.env[name];
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const getPasswordResetExpiry = (minutes) => new Date(Date.now() + minutes * 60 * 1000).toISOString();

const getSmtpTransport = () => {
  const host = getEnv('SMTP_HOST');
  const port = Number(getEnv('SMTP_PORT', '587'));
  const username = getEnv('SMTP_USERNAME');
  const password = getEnv('SMTP_PASSWORD');

  if (!host || !username || !password) {
    throw new Error('SMTP configuration is missing');
  }

  return {
    transport: nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure: port === 465,
      auth: { user: username, pass: password },
    }),
    from: getEnv('SMTP_FROM', username),
  };
};

const buildPasswordResetEmail = ({ name, otp }) => ({
  subject: 'Your Placify password reset code',
  text: [
    `Hi ${name || 'there'},`,
    '',
    `Use this 6-digit code to reset your Placify password: ${otp}`,
    '',
    'This code expires in 10 minutes.',
    'If you did not request a password reset, you can ignore this email.',
  ].join('\n'),
  html: `
    <div style="font-family:Arial,sans-serif;background:#0f0f0f;color:#f4f0eb;padding:24px;border-radius:16px;border:1px solid #2a2520;max-width:560px;margin:0 auto;">
      <p style="margin:0 0 12px;font-size:16px;">Hi ${name || 'there'},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#d9d2cb;">Use the code below to continue resetting your Placify password.</p>
      <div style="display:inline-block;padding:14px 20px;border-radius:12px;background:linear-gradient(135deg,#ff6b35 0%,#ff3d00 100%);color:#ffffff;font-size:28px;font-weight:700;letter-spacing:6px;">${otp}</div>
      <p style="margin:16px 0 0;font-size:14px;line-height:1.6;color:#a89e94;">This code expires in 10 minutes. If you did not request a password reset, you can safely ignore this email.</p>
    </div>
  `,
});

const sendPasswordResetEmail = async ({ to, name, otp }) => {
  const { transport, from } = getSmtpTransport();
  const email = buildPasswordResetEmail({ name, otp });

  await transport.sendMail({
    from,
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  });
};

const generateNumericOtp = () => String(crypto.randomInt(100000, 1000000));

const generateResetToken = () => crypto.randomBytes(32).toString('hex');

const sanitizeUser = (user) => ({
  id: user.userId,
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

    const existingUser = await userRepo.findByEmail(email.toLowerCase().trim());
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    const token = generateToken(user.userId);

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

    const user = await userRepo.findByEmail(email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatched = await bcrypt.compare(password, user.password);
    if (!passwordMatched) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user.userId);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return next(error);
  }
};

const requestPasswordReset = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await userRepo.findByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User does not exist' });
    }

    const otp = generateNumericOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await userRepo.update(user.userId, {
      passwordResetOtpHash: otpHash,
      passwordResetOtpExpiresAt: getPasswordResetExpiry(10),
      passwordResetSessionTokenHash: null,
      passwordResetSessionExpiresAt: null,
    });

    await sendPasswordResetEmail({ to: user.email, name: user.name, otp });

    return res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    return next(error);
  }
};

const verifyPasswordResetOtp = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await userRepo.findByEmail(email);

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (new Date(user.passwordResetOtpExpiresAt).getTime() < Date.now()) {
      await userRepo.update(user.userId, {
        passwordResetOtpHash: null,
        passwordResetOtpExpiresAt: null,
        passwordResetSessionTokenHash: null,
        passwordResetSessionExpiresAt: null,
      });
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const otpMatched = await bcrypt.compare(otp, user.passwordResetOtpHash);

    if (!otpMatched) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const resetToken = generateResetToken();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);

    await userRepo.update(user.userId, {
      passwordResetOtpHash: null,
      passwordResetOtpExpiresAt: null,
      passwordResetSessionTokenHash: resetTokenHash,
      passwordResetSessionExpiresAt: getPasswordResetExpiry(15),
    });

    return res.status(200).json({
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const resetToken = req.body.resetToken?.trim();
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    if (!email || !resetToken || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Email, reset token, and password fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const user = await userRepo.findByEmail(email);

    if (!user || !user.passwordResetSessionTokenHash || !user.passwordResetSessionExpiresAt) {
      return res.status(400).json({ message: 'Password reset session has expired' });
    }

    if (new Date(user.passwordResetSessionExpiresAt).getTime() < Date.now()) {
      await userRepo.update(user.userId, {
        passwordResetSessionTokenHash: null,
        passwordResetSessionExpiresAt: null,
      });
      return res.status(400).json({ message: 'Password reset session has expired' });
    }

    const tokenMatched = await bcrypt.compare(resetToken, user.passwordResetSessionTokenHash);

    if (!tokenMatched) {
      return res.status(400).json({ message: 'Password reset session has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await userRepo.update(user.userId, {
      password: hashedPassword,
      passwordResetOtpHash: null,
      passwordResetOtpExpiresAt: null,
      passwordResetSessionTokenHash: null,
      passwordResetSessionExpiresAt: null,
    });

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    return next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userRepo.findById(req.userId);

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

    const existing = await userRepo.findById(req.userId);

    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = await userRepo.update(req.userId, {
      profileType,
      workingRole: profileType === 'working_professional' ? workingRole : null,
      studentStatus: profileType === 'student' ? studentStatus : null,
      onboardingCompleted: true,
    });

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
    const allUsers = await userRepo.findAll();

    let users = allUsers.filter((u) => u.userId !== req.userId && u.onboardingCompleted);

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter((u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q)
      );
    }

    users.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    return res.status(200).json({
      users: users.map(sanitizeUser),
    });
  } catch (error) {
    return next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { linkedinUrl, name, studentStatus } = req.body;
    const user = await userRepo.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updateData = {};
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl || null;
    if (name && name.trim()) updateData.name = name.trim();
    if (studentStatus) {
      if (['placed', 'unplaced'].includes(studentStatus)) {
        updateData.studentStatus = studentStatus;
      } else {
        return res.status(400).json({ message: 'studentStatus must be placed or unplaced' });
      }
    }

    const updatedUser = await userRepo.update(req.userId, updateData);

    return res.status(200).json({ message: 'Profile updated', user: sanitizeUser(updatedUser) });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  verifyPasswordResetOtp,
  resetPassword,
  getCurrentUser,
  saveOnboarding,
  getAllUsers,
  updateProfile,
};
