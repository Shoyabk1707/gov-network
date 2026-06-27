const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // 🚀 Injected to handle runtime folder safety guards

// 📦 Setup Local Multer Disk Storage Configuration Engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB Upload thresholds limit guard
});

// Controllers
const chatController = require('../controllers/chatController');

// Standard Routes Mapping Operations
router.post('/start', authMiddleware, chatController.startConversation);
router.get('/conversations', authMiddleware, chatController.getConversations);
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/messages/:conversationId', authMiddleware, chatController.getMessages);
router.patch('/seen/:conversationId', authMiddleware, chatController.markAsSeen);

// 🚀 AIRTIGHT SECURE MULTIPART MEDIA DISPATCH GATEWAY
router.post('/message/media', authMiddleware, upload.single('chatMedia'), chatController.sendMediaMessage);

// 🗑️ NEW: Route to handle soft-deletion of a single message post entry
router.delete('/message/delete/:messageId', authMiddleware, chatController.deleteMessage);

// 🔄 NEW: Route to patch / update status delivery flags for double ticks sync
router.patch('/message/status', authMiddleware, chatController.updateMessageStatus);

module.exports = router;