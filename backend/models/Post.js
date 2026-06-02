const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Links the post to a specific verified user
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String, // e.g., "Official Circular", "Inter-Departmental", "General"
    default: "General",
  },
  // Holds the IDs of users who liked this post so they can't like it twice
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
    }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Post", postSchema);
