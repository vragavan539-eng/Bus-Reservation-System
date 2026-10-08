const express = require('express');
const router = express.Router();
const { getAnalytics, exportAnalytics } = require('../controllers/admin.analytics.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAnalytics);
router.get('/export', protect, authorize('admin'), exportAnalytics);

module.exports = router;