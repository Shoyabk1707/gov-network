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
  // 🚀 STATUS TRACKER FOR TICKS: 'sent' = Single, 'delivered' = Double Grey, 'read' = Double Blue
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  // 🚀 SOFT DELETE FLAG: True hote hi text replace ho jayega UI par
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