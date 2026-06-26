const mongoose = require('mongoose'); // 👈 Prevent any object/ID utility crash
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

// 🚀 1. Initiate or Find a Conversation Bridge
const startConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (String(currentUserId) === String(recipientId)) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, recipientId] }
    }).populate('participants', 'name jobTitle department avatar');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, recipientId]
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name jobTitle department avatar');
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Start Conversation Error:", error.message);
    res.status(500).json({ message: "Server Error starting conversation stream" });
  }
};

// 👥 2. Get All Active Conversations List for a User (DEBUGGED 🛠️)
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id || req.user; 

    if (!currentUserId) {
      return res.status(401).json({ message: "User context not identified." });
    }

    const conversations = await Conversation.find({
      participants: currentUserId
    })
    .populate('participants', 'name avatar jobTitle')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    if (!conversations || conversations.length === 0) {
      return res.status(200).json([]);
    }

    const enrichedConversations = await Promise.all(conversations.map(async (chat) => {
      const chatObj = chat.toObject();
      try {
        const unreadCount = await Message.countDocuments({
          conversationId: chat._id,
          sender: { $ne: currentUserId }, 
          seen: false 
        });
        chatObj.unreadCount = unreadCount || 0;
      } catch (err) {
        chatObj.unreadCount = 0;
      }
      return chatObj;
    }));

    res.status(200).json(enrichedConversations);
  } catch (err) {
    console.error("Get Conversations Crash Trace:", err.message);
    res.status(500).json({ message: "Error pulling conversation ledger metadata." });
  }
};

// 💬 3. Send a Message & Update Last Message Pointer
const sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const newMessage = await Message.create({
      conversationId,
      sender: currentUserId,
      text: text.trim()
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send Message Error:", error.message);
    res.status(500).json({ message: "Server Error dispatching text package" });
  }
};

// 📡 4. Fetch Message History For an Active Stream Window
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error.message);
    res.status(500).json({ message: "Server Error pulling transmission logs" });
  }
};

// 🔴 5. Mark Messages as Seen (DEBUGGED 🛠️)
const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user?._id || req.user?.id || req.user; 

    await Message.updateMany(
      { conversationId, sender: { $ne: currentUserId }, seen: false },
      { $set: { seen: true } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mark As Seen Crash Trace:", err.message);
    res.status(500).json({ message: "Fault writing seen flags state." });
  }
};

// 🚀 6. NEW: Send a Media Attachment Message
const sendMediaMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No media asset detected in pipeline." });
    }

    const mediaUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newMessage = await Message.create({
      conversationId,
      sender: currentUserId,
      text: text ? text.trim() : "",
      mediaUrl: mediaUrl
    });

    // 🚀 FIXED: Added explicit updatedAt query to force real-time inbox ranking update
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send Media Message Error:", error.message);
    res.status(500).json({ message: "Server Error dispatching media package" });
  }
};

module.exports = {
  startConversation,
  getConversations,
  sendMessage,
  getMessages,
  markAsSeen,
  sendMediaMessage // 🔥 Exported safely to sync with routers mapping
};