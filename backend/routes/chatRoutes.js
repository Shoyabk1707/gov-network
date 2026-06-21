const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { startConversation, getConversations, sendMessage, getMessages } = require('../controllers/chatController');

router.post('/start', authMiddleware, startConversation);
router.get('/conversations', authMiddleware, getConversations);
router.post('/message', authMiddleware, sendMessage);
router.get('/messages/:conversationId', authMiddleware, getMessages);

module.exports = router;