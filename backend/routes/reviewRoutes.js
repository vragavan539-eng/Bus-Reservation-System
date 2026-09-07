const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Review = require('../models/Review');
const Bus = require('../models/Bus');
const asyncHandler = require('express-async-handler');

router.post('/', protect, asyncHandler(async (req, res) => {
  const review = await Review.create({ ...req.body, user: req.user.id });
  const reviews = await Review.find({ bus: req.body.bus });
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  await Bus.findByIdAndUpdate(req.body.bus, { rating: avg, totalReviews: reviews.length });
  res.status(201).json({ success: true, review });
}));

router.get('/bus/:busId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ bus: req.params.busId }).populate('user', 'name avatar');
  res.json({ success: true, reviews });
}));
module.exports = router;