const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getOrCreateSession,
  getMessages,
  sendMessage,
  getAllSessions,
  closeSession,
} = require('../controllers/chatController');

router.get('/sessions', protect, authorize('admin'), getAllSessions);
router.post('/session', protect, getOrCreateSession);
router.get('/:sessionId/messages', protect, getMessages);
router.post('/:sessionId/messages', protect, sendMessage);
router.put('/:sessionId/close', protect, closeSession);

module.exports = router;