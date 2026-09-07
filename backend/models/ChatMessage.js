const mongoose = require('mongoose');

// A chat session represents one support conversation for a user.
const chatSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, default: 'General Support' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A chat message belongs to a session, sent by user / agent / bot.
const chatMessageSchema = new mongoose.Schema(
  {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
    sender: { type: String, enum: ['user', 'agent', 'bot'], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = { ChatMessage, ChatSession };