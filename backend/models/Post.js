const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  page: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Page", 
    default: null, 
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String, 
    default: "General",
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  // 💬 NEW: Comments Array Added
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Kisne comment kiya
        required: true
      },
      text: {
        type: String, // Kya comment kiya
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now // Kab comment kiya
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);