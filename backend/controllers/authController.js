import crypto from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import { welcomeEmail, resetPasswordEmail } from '../utils/emailTemplates.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  address: user.address,
  role: user.role,
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // The configured admin email is auto-promoted to the admin role.
  const role =
    email.toLowerCase() === (process.env.ADMIN_EMAIL || '').toLowerCase()
      ? 'admin'
      : 'user';

  const user = await User.create({ name, email, password, phone, role });
  const token = generateToken(res, user._id);

  // Send welcome email asynchronously in the background so it doesn't block the response
  sendEmail({
    to: user.email,
    subject: 'Welcome to Zyvora ✨',
    html: welcomeEmail(user.name),
  });

  res.status(201).json({ success: true, token, user: sanitizeUser(user) });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact support.');
  }

  const token = generateToken(res, user._id);
  res.json({ success: true, token, user: sanitizeUser(user) });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

// @desc    Forgot password — email a reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  // Always respond success to avoid leaking which emails are registered.
  if (!user) {
    return res.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
    });
  }

  const rawToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Reset Your Zyvora Password',
    html: resetPasswordEmail(user.name, resetUrl),
  });

  res.json({
    success: true,
    message: 'If that email exists, a reset link has been sent.',
  });
});

// @desc    Reset password using the emailed token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const token = generateToken(res, user._id);
  res.json({ success: true, token, message: 'Password reset successful' });
});
