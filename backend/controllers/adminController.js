const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBookings, totalBuses, totalRoutes] = await Promise.all([
    User.countDocuments({ role: 'user' }), Booking.countDocuments(),
    Bus.countDocuments({ isActive: true }), Route.countDocuments({ isActive: true })
  ]);
  const revenue = await Booking.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$finalAmount' } } }]);
  const recentBookings = await Booking.find().populate('user route').sort({ createdAt: -1 }).limit(10);
  const monthlyRevenue = await Booking.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$finalAmount' }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } }, { $limit: 12 }
  ]);
  res.json({ success: true, stats: { totalUsers, totalBookings, totalBuses, totalRoutes, totalRevenue: revenue[0]?.total || 0 }, recentBookings, monthlyRevenue });
});

exports.getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const filter = search ? { $or: [{ name: new RegExp(search,'i') }, { email: new RegExp(search,'i') }] } : {};
  const users = await User.find(filter).limit(limit * 1).skip((page - 1) * limit).sort({ createdAt: -1 });
  const total = await User.countDocuments(filter);
  res.json({ success: true, users, total });
});

exports.blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: true }, { new: true });
  res.json({ success: true, user });
});

exports.unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isBlocked: false }, { new: true });
  res.json({ success: true, user });
});