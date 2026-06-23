const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: false // 👈 Fixed: Ab khali text hone par bhi image successfully post ho jayegi
  },
  image: {
    type: String,
    default: null // 👈 Fixed: Main Post attachment Cloudinary URL store karne ke liye
  },
  category: {
    type: String,
    enum: [
      'Networking', 'Job Updates', 'Study Resources', 'General', 
      'Official Circular', 'Urgent Update',
      'Exam update', 'Study material'
    ],
    default: 'General'
  },
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Page',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    image: { 
      type: String, 
      default: null 
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);