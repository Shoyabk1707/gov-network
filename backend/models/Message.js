// 📑 models/Message.js file kholo aur check karo ki schema is tarah dikhe:
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  // 🔥 INJECT THIS CRITICAL FLAG MATRIX:
  seen: {
    type: Boolean,
    default: false // Har naya message default unread rahega
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);