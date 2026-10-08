const crypto = require('crypto');
const asyncHandler = require('../middleware/asyncHandler');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper: sign JWT and send response
const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      wallet: user.wallet,
    },
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!phone) {
    res.status(400);
    throw new Error('Phone number is required');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error('Email already registered');
  }

  const user = await User.create({ name, email, phone, password });
  sendToken(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact support.');
  }

  sendToken(user, 200, res);
});

// @desc    Google OAuth login
// @route   POST /api/auth/google
exports.googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) {
    res.status(400);
    throw new Error('Missing Google credential');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload(); // { email, name, picture, ... }

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      phone: '',
      password: Math.random().toString(36).slice(2) + Date.now(), // random, unused
      avatar: payload.picture,
      isVerified: true,
    });
  }

  sendToken(user, 200, res);
});

// @desc    Get current logged-in user
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
});

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, avatar },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, user });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

// @desc    Forgot password — sends OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error('No account found with that email');
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  user.otp = otp;
  user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  console.log(`📧 OTP for ${user.email}: ${otp}`); // dev fallback — visible here even if email fails below

  try {
    await sendEmail({
      to: user.email,
      subject: 'BusGo — Your password reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 420px; margin: 0 auto;">
          <h2 style="color:#FF7A33;">BusGo</h2>
          <p>Hi ${user.name},</p>
          <p>Your OTP to reset your password is:</p>
          <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #151B3B;">${otp}</p>
          <p>This code expires in 10 minutes. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (emailErr) {
    console.error('Email send failed (check the OTP logged above to continue testing):', emailErr.message);
    // Not throwing here on purpose during setup — OTP is still valid and logged above.
    // Once email is confirmed working, you can restore the strict failure below:
    // res.status(500); throw new Error('Could not send OTP email. Please try again.');
  }

  res.status(200).json({ success: true, message: 'OTP sent to your registered email' });
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword, password } = req.body;
  const finalPassword = newPassword || password;

  if (!finalPassword) {
    res.status(400);
    throw new Error('New password is required');
  }

  const user = await User.findOne({
    email,
    otp,
    otpExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired OTP');
  }

  user.password = finalPassword;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  sendToken(user, 200, res);
});

// @desc    Logout user
// @route   GET /api/auth/logout
exports.logout = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});