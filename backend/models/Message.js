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
    default: "" // 🚀 CHANGE HERE: Make it optional so images can be sent without text
  },
  mediaUrl: {
    type: String,
    default: "" // 🚀 ADD THIS LINE: To support image attachment storage paths
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);