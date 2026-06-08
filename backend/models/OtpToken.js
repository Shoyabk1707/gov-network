const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true // Fast lookup optimization
  },
  otpHash: {
    type: String,
    required: true
  },
  attempts: {
    type: Number,
    required: true,
    default: 0 // Brute-force validation tracker
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // 🚀 5 MINUTES TTL: MongoDB will auto-delete this document exactly after 5 mins!
  }
});

module.exports = mongoose.model('OtpToken', otpTokenSchema);