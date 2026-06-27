const mongoose = require('mongoose'); // 👈 Prevent any object/ID utility crash
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const cloudinary = require('cloudinary').v2; // 🚀 Cloudinary Service Connector
const fs = require('fs'); // 👈 File Stream handling to auto-cleanup local memory cache

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

    // Default status during execution setup is 'sent'
    const newMessage = await Message.create({
      conversationId,
      sender: currentUserId,
      text: text.trim(),
      status: 'sent'
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
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

// 🔴 5. Mark Messages as Seen & Read (Double Blue Ticks)
const markAsSeen = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user?._id || req.user?.id || req.user; 

    // 🔥 UPDATED: Update status fields data state to 'read' along with seen flag logic
    await Message.updateMany(
      { conversationId, sender: { $ne: currentUserId }, status: { $ne: 'read' } },
      { $set: { seen: true, status: 'read' } }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mark As Seen Crash Trace:", err.message);
    res.status(550).json({ message: "Fault writing seen flags state." });
  }
};

// 🚀 6. Send a Media Attachment Message via Cloudinary CDN
const sendMediaMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No media asset detected in pipeline." });
    }

    const cloudinaryUploadResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: 'chat_attachments',
      resource_type: 'auto'
    });

    const mediaUrl = cloudinaryUploadResponse.secure_url;

    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    const newMessage = await Message.create({
      conversationId,
      sender: currentUserId,
      text: text ? text.trim() : "",
      mediaUrl: mediaUrl,
      status: 'sent'
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: new Date()
    });

    res.status(201).json(newMessage);
  } catch (error) {
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Send Media Message Error:", error.message);
    res.status(500).json({ message: "Server Error dispatching media package via Cloudinary" });
  }
};

// 🗑️ 7. FIXED: Soft-Delete Message Route Controller Functionality (Airtight ID Handshake)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // 🔥 SAFELY EXTRACT: Extract user ID exactly how it's handled in sendMessage / getConversations
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!currentUserId) {
      return res.status(401).json({ message: "User session context not identified." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Requested message log not found." });
    }

    // 🚀 AIRTIGHT HANDSHAKE: Convert both objects to standard string to prevent strict hex/mismatch blocks
    const senderIdStr = message.sender._id ? String(message.sender._id) : String(message.sender);
    const currentUserIdStr = currentUserId._id ? String(currentUserId._id) : String(currentUserId);

    if (senderIdStr !== currentUserIdStr) {
      return res.status(403).json({ message: "Unauthorized operation attempt. Owner context mismatch." });
    }

    // Toggle flags configuration mapping values
    message.isDeleted = true;
    message.text = "This message was deleted";
    message.mediaUrl = ""; // Clears attachment reference path link 
    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error("Delete Message Error:", error.message);
    res.status(500).json({ message: "Server Error updating message data block status." });
  }
};

// 🔄 8. NEW: Bulk Update Message Status (Used to switch single to double ticks on app launch)
const updateMessageStatus = async (req, res) => {
  try {
    const { conversationId, status } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!['delivered', 'read'].includes(status)) {
      return res.status(400).json({ message: "Invalid status parameters provided." });
    }

    await Message.updateMany(
      { conversationId, sender: { $ne: currentUserId }, status: 'sent' },
      { $set: { status: status } }
    );

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Update Status Error:", error.message);
    res.status(500).json({ message: "Server Error refreshing metadata status keys." });
  }
};

module.exports = {
  startConversation,
  getConversations,
  sendMessage,
  getMessages,
  markAsSeen,
  sendMediaMessage,
  deleteMessage,       // 🚀 Exported for routing linkage configuration
  updateMessageStatus  // 🚀 Exported for sync operations
};