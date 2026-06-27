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
    default: "" 
  },
  mediaUrl: {
    type: String,
    default: "" 
  },
  // 🚀 1. FILE TYPE TRACKER: 'image' or 'document' (PDF, Excel, etc.)
  fileType: {
    type: String,
    enum: ['text', 'image', 'document'],
    default: 'text'
  },
  // 🚀 3. MESSAGE REPLY THREADING REFERENCE: Parent message binding pointer
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  seen: {
    type: Boolean,
    default: false
  }
}, { timestamps: true }); 

module.exports = mongoose.model('Message', MessageSchema);