const asyncHandler = require('express-async-handler');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const User = require('../models/User');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay Order
exports.createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId).populate('route user');
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.user._id.toString() !== req.user.id) { res.status(403); throw new Error('Not authorized'); }

  const options = {
    amount: Math.round(booking.finalAmount * 100), // paise
    currency: 'INR',
    receipt: booking.bookingId,
    notes: {
      bookingId: booking._id.toString(),
      userId: req.user.id,
      route: booking.route ? `${booking.route.from} to ${booking.route.to}` : ''
    }
  };

  let order;
  try {
    order = await razorpay.orders.create(options);
  } catch (razorpayErr) {
    // IMPORTANT: Razorpay's own errors often carry statusCode 401/400.
    // We must NOT let that leak through as our response status — the frontend
    // treats any 401 as "session expired" and force-logs the user out.
    console.error('❌ Razorpay order creation failed:', razorpayErr?.error || razorpayErr);
    res.status(502); // 502 = "upstream payment provider failed", never confused with auth
    throw new Error(
      razorpayErr?.error?.description ||
      'Payment gateway error — check Razorpay API keys in .env'
    );
  }

  res.json({
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
    bookingId: booking._id,
    bookingDetails: {
      bookingCode: booking.bookingId,
      amount: booking.finalAmount,
      passengers: booking.passengers?.length
    }
  });
});

// Verify Razorpay Payment Signature
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

  // Verify signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400); throw new Error('Payment verification failed - Invalid signature');
  }

  // Update booking
  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    {
      paymentStatus: 'paid',
      paymentId: razorpay_payment_id,
      paymentMethod: 'razorpay',
      status: 'confirmed'
    },
    { new: true }
  ).populate('route bus user');

  if (!booking) { res.status(404); throw new Error('Booking not found'); }

  res.json({
    success: true,
    message: 'Payment verified and booking confirmed!',
    booking
  });
});

// Get payment details
exports.getPaymentDetails = asyncHandler(async (req, res) => {
  const payment = await razorpay.payments.fetch(req.params.paymentId);
  res.json({ success: true, payment });
});

// Refund payment
exports.refundPayment = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) { res.status(404); throw new Error('Booking not found'); }
  if (booking.status !== 'cancelled') { res.status(400); throw new Error('Booking is not cancelled'); }
  if (!booking.paymentId) { res.status(400); throw new Error('No payment found for this booking'); }
  if (booking.refundStatus === 'completed') { res.status(400); throw new Error('Already refunded'); }

  const refundAmount = Math.round(booking.refundAmount * 100); // paise
  if (refundAmount <= 0) { res.status(400); throw new Error('No refund applicable'); }

  let refund;
  try {
    refund = await razorpay.payments.refund(booking.paymentId, {
      amount: refundAmount,
      notes: { reason: booking.cancellationReason || 'User cancelled' }
    });
  } catch (razorpayErr) {
    console.error('❌ Razorpay refund failed:', razorpayErr?.error || razorpayErr);
    res.status(502);
    throw new Error(razorpayErr?.error?.description || 'Refund failed at payment gateway');
  }

  booking.refundStatus = 'completed';
  booking.paymentStatus = 'refunded';
  await booking.save();

  res.json({
    success: true,
    message: `Refund of ₹${booking.refundAmount} initiated successfully!`,
    refundId: refund.id,
    booking
  });
});

// Webhook handler
exports.handleWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest !== req.headers['x-razorpay-signature']) {
    res.status(400); throw new Error('Invalid webhook signature');
  }

  const { event, payload } = req.body;

  if (event === 'payment.captured') {
    const paymentId = payload.payment.entity.id;
    const notes = payload.payment.entity.notes;
    if (notes?.bookingId) {
      await Booking.findByIdAndUpdate(notes.bookingId, {
        paymentStatus: 'paid', paymentId, status: 'confirmed'
      });
    }
  }

  if (event === 'refund.processed') {
    const notes = payload.refund.entity.notes;
    if (notes?.bookingId) {
      await Booking.findByIdAndUpdate(notes.bookingId, { refundStatus: 'completed', paymentStatus: 'refunded' });
    }
  }

  res.json({ status: 'ok' });
});