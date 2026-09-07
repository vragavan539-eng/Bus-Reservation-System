const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPaymentDetails, refundPayment, handleWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-order',   protect, createOrder);
router.post('/verify',         protect, verifyPayment);
router.post('/refund',         protect, refundPayment);
router.get('/details/:paymentId', protect, getPaymentDetails);
router.post('/webhook',        handleWebhook); // No auth - Razorpay calls this
module.exports = router;