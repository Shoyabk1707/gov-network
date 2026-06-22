const mongoose = require('mongoose'); // 👈 Add this line to prevent any object/ID utility crash
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
    // 🔥 Sabse safe tarika ID nikalne ka jo baki functions me chal raha hai
    const currentUserId = req.user?._id || req.user?.id || req.user; 

    if (!currentUserId) {
      return res.status(401).json({ message: "User context not identified." });
    }

    // Saare conversations fetch karo jisme current user participant hai
    const conversations = await Conversation.find({
      participants: currentUserId
    })
    .populate('participants', 'name avatar jobTitle')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    if (!conversations || conversations.length === 0) {
      return res.status(200).json([]);
    }

    // Har conversation ke liye individually unreadCount calculate karo
    const enrichedConversations = await Promise.all(conversations.map(async (chat) => {
      const chatObj = chat.toObject();
      try {
        const unreadCount = await Message.countDocuments({
          conversationId: chat._id,
          sender: { $ne: currentUserId }, // Jo kisi aur ne bheja ho
          seen: false // Aur abhi tak unseen ho
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
    const currentUserId = req.user?._id || req.user?.id || req.user; // 🔥 Aligned with standard extractors

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

module.exports = {
  startConversation,
  getConversations,
  sendMessage,
  getMessages,
  markAsSeen
};