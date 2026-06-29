const Notification = require('../models/Notification');

// ==========================================
// 📊 ACTION 1: GET LIVE NAVBAR BADGE COUNTS 
// ==========================================
const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    // Database search parsing flags set to false safely
    const unreadNotifications = await Notification.countDocuments({ 
      recipient: userId, 
      isRead: false 
    });

    res.status(200).json({
      unreadNotifications: unreadNotifications,
      unreadMessages: 0 // Hooked cleanly to message model schemas later
    });
  } catch (error) {
    console.error('Fetch Badges Error:', error.message);
    res.status(500).json({ message: 'Server context transaction error.' });
  }
};

// ==========================================
// 📡 ACTION 2: FETCH ALL NOTIFICATIONS LOGS
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    const notifications = await Notification.find({ recipient: userId })
      .populate('fromUser', 'name role avatar') // Added avatar population buffer support
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { 
  getNotifications,
  getUnreadCounts // 🚀 EXPORTED NEW VALUE HANDLER
};