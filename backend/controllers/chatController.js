const { ChatMessage, ChatSession } = require('../models/ChatMessage');
const { generateBotReply } = require('../utils/aiChat');

// @desc  Start or get the user's active chat session
// @route POST /api/chat/session
// @access Private
exports.getOrCreateSession = async (req, res) => {
  try {
    let session = await ChatSession.findOne({ user: req.user._id, status: 'open' });
    if (!session) {
      session = await ChatSession.create({ user: req.user._id, subject: req.body.subject || 'General Support' });
      await ChatMessage.create({
        session: session._id,
        sender: 'bot',
        message: "Hi! 👋 Welcome to BusGo support. How can we help you today?",
      });
    }
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get messages for a session
// @route GET /api/chat/:sessionId/messages
// @access Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ session: req.params.sessionId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Send a message (from user or agent)
// @route POST /api/chat/:sessionId/messages
// @access Private
exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const isAgent = req.user.role === 'admin';

    const chatMessage = await ChatMessage.create({
      session: req.params.sessionId,
      sender: isAgent ? 'agent' : 'user',
      senderId: req.user._id,
      message,
    });

    await ChatSession.findByIdAndUpdate(req.params.sessionId, { lastMessageAt: new Date() });

    // Auto-reply with AI only for user messages, and only if no human agent
    // has taken over this session yet (assignedAgent is empty).
    if (!isAgent) {
      const session = await ChatSession.findById(req.params.sessionId);
      if (session && !session.assignedAgent) {
        const history = await ChatMessage.find({ session: req.params.sessionId }).sort({ createdAt: 1 });
        const replyText = await generateBotReply(history, message);

        const botMessage = await ChatMessage.create({
          session: req.params.sessionId,
          sender: 'bot',
          message: replyText,
        });
        await ChatSession.findByIdAndUpdate(req.params.sessionId, { lastMessageAt: new Date() });

        return res.status(201).json({ userMessage: chatMessage, botMessage });
      }
    }

    res.status(201).json({ userMessage: chatMessage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Admin: list all open sessions
// @route GET /api/chat/sessions
// @access Private/Admin
exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await ChatSession.find().populate('user', 'name email').sort({ lastMessageAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Close a chat session
// @route PUT /api/chat/:sessionId/close
// @access Private
exports.closeSession = async (req, res) => {
  try {
    const session = await ChatSession.findByIdAndUpdate(req.params.sessionId, { status: 'closed' }, { new: true });
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};