const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Controllers: Ensure sendMediaMessage is directly destructured here
const chatController = require('../controllers/chatController');

router.post('/start', authMiddleware, chatController.startConversation);
router.get('/conversations', authMiddleware, chatController.getConversations);
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/messages/:conversationId', authMiddleware, chatController.getMessages);
router.patch('/seen/:conversationId', authMiddleware, chatController.markAsSeen);

// 🚀 FIXED: Pointing strictly to chatController object directly to prevent undefined handshakes
router.post('/message/media', authMiddleware, upload.single('chatMedia'), chatController.sendMediaMessage);

module.exports = router;