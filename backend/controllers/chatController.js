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

    // Check if conversation already exists between these two participants
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

// 👥 2. Get All Active Conversations List for a User
const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id || req.user;

    const conversations = await Conversation.find({
      participants: currentUserId
    })
      .populate('participants', 'name jobTitle department avatar')
      .populate({
        path: 'lastMessage',
        select: 'text sender createdAt'
      })
      .sort({ updatedAt: -1 }); // Modern updates first rule

    res.json(conversations);
  } catch (error) {
    console.error("Get Conversations Error:", error.message);
    res.status(500).json({ message: "Server Error fetching conversations stream" });
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

    // 1. Create message item inside memory registry
    const newMessage = await Message.create({
      conversationId,
      sender: currentUserId,
      text: text.trim()
    });

    // 2. Lock dynamic index pointer to parent log context
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
      .sort({ createdAt: 1 }); // Timelines must be chronological ascending order

    res.json(messages);
  } catch (error) {
    console.error("Get Messages Error:", error.message);
    res.status(500).json({ message: "Server Error pulling transmission logs" });
  }
};

module.exports = {
  startConversation,
  getConversations,
  sendMessage,
  getMessages
};