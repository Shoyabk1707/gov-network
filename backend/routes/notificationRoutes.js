const express = require('express');
const router = express.Router();
const { getNotifications, getUnreadCounts, markNotificationsAsRead } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getNotifications);
router.get('/unread-counts', auth, getUnreadCounts);
router.put('/mark-as-read', auth, markNotificationsAsRead);

module.exports = router;