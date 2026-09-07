const asyncHandler = require('express-async-handler');
const Bus = require('../models/Bus');

exports.getAllBuses = asyncHandler(async (req, res) => {
  const { busType, isActive, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (busType) filter.busType = busType;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  const buses = await Bus.find(filter).limit(limit * 1).skip((page - 1) * limit).sort({ rating: -1 });
  const total = await Bus.countDocuments(filter);
  res.json({ success: true, buses, total, pages: Math.ceil(total / limit) });
});

exports.getBusById = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) { res.status(404); throw new Error('Bus not found'); }
  res.json({ success: true, bus });
});

exports.createBus = asyncHandler(async (req, res) => {
  const bus = await Bus.create(req.body);
  res.status(201).json({ success: true, bus });
});

exports.updateBus = asyncHandler(async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!bus) { res.status(404); throw new Error('Bus not found'); }
  res.json({ success: true, bus });
});

exports.deleteBus = asyncHandler(async (req, res) => {
  await Bus.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Bus deleted' });
});

exports.getBusSeats = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id).select('seats totalSeats busName');
  if (!bus) { res.status(404); throw new Error('Bus not found'); }
  res.json({ success: true, seats: bus.seats, totalSeats: bus.totalSeats });
});