const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// ==========================================
// 📊 ACTION 1: INITIAL COUNTS READ ENGINE
// ==========================================
const getUnreadCounts = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    const unreadNotifications = await Notification.countDocuments({ 
      recipient: new mongoose.Types.ObjectId(userId.toString()), 
      isRead: false 
    });

    res.status(200).json({
      unreadNotifications: unreadNotifications,
      unreadMessages: 0 
    });
  } catch (error) {
    console.error('Fetch Badges Error:', error.message);
    res.status(500).json({ message: 'Server badges context sequence fault.' });
  }
};

// ==========================================
// 📡 ACTION 2: FETCH REALTIME SYSTEM AGGREGATES LOGS
// ==========================================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    // Aggressive database filtering: Groups matching traces down instantly
    const cleanLogs = await Notification.aggregate([
      { 
        $match: { 
          recipient: new mongoose.Types.ObjectId(userId.toString()) 
        } 
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            fromUser: "$fromUser",
            type: "$type",
            postId: "$postId" // Isolate loops to prevent merging actions on different streams
          },
          latestRecord: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$latestRecord" } },
      { $sort: { createdAt: -1 } }
    ]);

    // Data collections framework execution mapper safe parsing
    const populatedLogs = await Notification.populate(cleanLogs, {
      path: 'fromUser',
      select: 'name role avatar'
    });

    res.json(populatedLogs);
  } catch (error) {
    console.error('Fetch Clean Notifications Error:', error.message);
    res.status(500).json({ message: 'Server database records collection fault.' });
  }
};

// ==========================================
// 🛠️ ACTION 3: FULL PURGE CLEAR FLUSH MATRIX
// ==========================================
const markNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    await Notification.updateMany(
      { recipient: new mongoose.Types.ObjectId(userId.toString()), isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ success: true, message: "Notifications marked read safely." });
  } catch (error) {
    console.error('Bulk update indicators error:', error.message);
    res.status(500).json({ message: 'Server synchronization data error.' });
  }
};

module.exports = { 
  getNotifications,
  getUnreadCounts,
  markNotificationsAsRead
};