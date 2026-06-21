const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema(
  {
    // Dono side ke participants ki IDs is array me rahengi
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    // Chat list me direct scroll optimized previews dikhane ke liye last message reference tracking
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Conversation', ConversationSchema);