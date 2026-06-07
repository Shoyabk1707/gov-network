const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.user;

    const notifications = await Notification.find({ recipient: userId })
      .populate('fromUser', 'name role')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Fetch Notifications Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getNotifications };