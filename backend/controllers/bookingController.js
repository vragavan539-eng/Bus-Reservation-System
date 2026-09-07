const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Route = require('../models/Route');
const User = require('../models/User');

exports.createBooking = asyncHandler(async (req, res) => {
  const { routeId, busId, travelDate, passengers, boardingPoint, droppingPoint, paymentMethod } = req.body;
  const route = await Route.findById(routeId).populate('bus');
  if (!route) { res.status(404); throw new Error('Route not found'); }
  const existing = await Booking.find({ route: routeId, travelDate: new Date(travelDate), status: { $in: ['confirmed','pending'] } });
  const bookedSeats = existing.flatMap(b => b.passengers.map(p => p.seatNumber));
  const conflict = passengers.map(p => p.seatNumber).some(s => bookedSeats.includes(s));
  if (conflict) { res.status(400); throw new Error('One or more seats already booked'); }
  const totalAmount = route.basePrice * passengers.length;
  const discount = totalAmount > 2000 ? totalAmount * 0.05 : 0;
  const finalAmount = totalAmount - discount;
  const booking = await Booking.create({ user: req.user.id, route: routeId, bus: busId, travelDate, passengers, boardingPoint, droppingPoint, totalAmount, discount, finalAmount, paymentMethod, status: 'pending', paymentStatus: 'pending' });
  await User.findByIdAndUpdate(req.user.id, { $push: { bookings: booking._id } });
  const populated = await Booking.findById(booking._id).populate('route bus user');
  res.status(201).json({ success: true, booking: populated });
});

exports.getUserBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = { user: req.user.id };
  if (status) filter.status = status;
  const bookings = await Booking.find(filter).populate('route bus').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
  const total = await Booking.countDocuments(filter);
  res.json({ success: true, bookings, total });
});

exports.getBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate('route bus user');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  res.json({ success: true, booking });
});

exports.cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') { res.status(403); throw new Error('Not authorized'); }
  if (booking.status === 'cancelled') { res.status(400); throw new Error('Already cancelled'); }
  const hoursUntilTravel = (new Date(booking.travelDate) - new Date()) / (1000 * 60 * 60);
  let refundAmount = 0;
  if (hoursUntilTravel > 24) refundAmount = booking.finalAmount * 0.9;
  else if (hoursUntilTravel > 4) refundAmount = booking.finalAmount * 0.5;
  booking.status = 'cancelled'; booking.cancellationReason = req.body.reason || 'User cancelled';
  booking.refundAmount = refundAmount; booking.refundStatus = refundAmount > 0 ? 'initiated' : 'none';
  await booking.save();
  res.json({ success: true, booking, refundAmount });
});

exports.getBookingByPNR = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ pnr: req.params.pnr }).populate('route bus');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  res.json({ success: true, booking });
});

exports.getAllBookings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const bookings = await Booking.find(filter).populate('user route bus').sort({ createdAt: -1 }).limit(limit * 1).skip((page - 1) * limit);
  const total = await Booking.countDocuments(filter);
  res.json({ success: true, bookings, total });
});

exports.confirmPayment = asyncHandler(async (req, res) => {
  const { bookingId, paymentId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  booking.paymentStatus = 'paid'; booking.paymentId = paymentId; booking.status = 'confirmed';
  await booking.save();
  res.json({ success: true, booking });
});