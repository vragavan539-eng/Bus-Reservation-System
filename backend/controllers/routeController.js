const asyncHandler = require('express-async-handler');
const Route = require('../models/Route');

exports.searchRoutes = asyncHandler(async (req, res) => {
  const { from, to, date, busType, maxPrice, sortBy } = req.query;
  if (!from || !to) { res.status(400); throw new Error('from and to are required'); }
  const filter = { from: new RegExp(from, 'i'), to: new RegExp(to, 'i'), isActive: true };
  if (maxPrice) filter.basePrice = { $lte: Number(maxPrice) };
  let routes = await Route.find(filter).populate({
    path: 'bus',
    match: busType ? { busType, isActive: true } : { isActive: true },
    select: 'busName busNumber busType totalSeats amenities rating totalReviews images features'
  });
  routes = routes.filter(r => r.bus !== null);
  if (sortBy === 'price') routes.sort((a, b) => a.basePrice - b.basePrice);
  if (sortBy === 'rating') routes.sort((a, b) => (b.bus?.rating || 0) - (a.bus?.rating || 0));
  res.json({ success: true, routes, total: routes.length });
});

exports.getAllRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find().populate('bus', 'busName busType rating');
  res.json({ success: true, routes });
});

exports.getRouteById = asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id).populate('bus');
  if (!route) { res.status(404); throw new Error('Route not found'); }
  res.json({ success: true, route });
});

exports.createRoute = asyncHandler(async (req, res) => {
  const route = await Route.create(req.body);
  res.status(201).json({ success: true, route });
});

exports.updateRoute = asyncHandler(async (req, res) => {
  const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, route });
});

exports.deleteRoute = asyncHandler(async (req, res) => {
  await Route.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Route deleted' });
});

exports.getPopularRoutes = asyncHandler(async (req, res) => {
  const routes = await Route.find({ isActive: true }).populate('bus', 'busName busType rating images').limit(6);
  res.json({ success: true, routes });
});