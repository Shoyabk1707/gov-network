const express = require('express');
const router = express.Router();
const { getNotifications } = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getNotifications);
module.exports = router;