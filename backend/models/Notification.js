const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Kisko notification dikhani hai
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Kisne action kiya
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'mentorship_request', 'request_accepted'],
    required: true
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: null
  },
  message: {
    type: String,
    required: true // Jaise: 'liked your post.', 'started following you.'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// =========================================================================
// 🚀 ENTERPRISE SCALABILITY LAYER: COMPOUND UNIQUE CONSTRAINT MATRIX
// =========================================================================
// Target combo block: recipient + fromUser + type agar 'follow' hai toh unique document handle system generate hoga.
// Is dynamic lookup filters trigger logic se pure database schema layer par duplicates generate hona absolute zero locked ho jayega.
notificationSchema.index(
  { recipient: 1, fromUser: 1, type: 1 },
  { 
    unique: true, 
    partialFilterExpression: { type: 'follow' } 
  }
);

// High-speed dashboard reads performance optimizer checks logic
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);