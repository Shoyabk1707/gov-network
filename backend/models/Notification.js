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

module.exports = mongoose.model('Notification', notificationSchema);