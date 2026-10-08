const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  blockUser,
  unblockUser,
  getAnalytics,
  exportAnalytics,
  // Bookings
  getAllBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

// ---------- Dashboard ----------
router.get('/dashboard', getDashboardStats);

// ---------- Users ----------
router.get('/users', getAllUsers);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// ---------- Analytics ----------
router.get('/analytics', getAnalytics);
router.get('/analytics/export', exportAnalytics);

// ---------- Bookings CRUD ----------
router.get('/bookings',        getAllBookings);
router.post('/bookings',       createBooking);
router.put('/bookings/:id',    updateBooking);
router.delete('/bookings/:id', deleteBooking);

module.exports = router;