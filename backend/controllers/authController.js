const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true, token,
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar, wallet: user.wallet, isVerified: user.isVerified }
  });
};

exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) { res.status(400); throw new Error('Email already registered'); }
  const user = await User.create({ name, email, phone, password });
  sendToken(user, 201, res);
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400); throw new Error('Please provide email and password'); }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) { res.status(401); throw new Error('Invalid credentials'); }
  sendToken(user, 200, res);
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('bookings');
  res.json({ success: true, user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true, runValidators: true });
  res.json({ success: true, user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.matchPassword(currentPassword))) { res.status(400); throw new Error('Current password is wrong'); }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) { res.status(404); throw new Error('No user with that email'); }
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp; user.otpExpire = Date.now() + 10 * 60 * 1000;
  await user.save();
  res.json({ success: true, message: 'OTP sent to email', otp }); // Remove otp in production
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;
  const user = await User.findOne({ email, otp, otpExpire: { $gt: Date.now() } });
  if (!user) { res.status(400); throw new Error('Invalid or expired OTP'); }
  user.password = password; user.otp = undefined; user.otpExpire = undefined;
  await user.save();
  sendToken(user, 200, res);
});

exports.logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});