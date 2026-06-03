const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  bio: { type: String },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);