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

// 🚀 UPDATED: Added structural file filter to smoothly allow PDFs and Docs along with Images
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format extension.'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter, // 👈 Added filter gateway connection
  limits: { fileSize: 10 * 1024 * 1024 } // 🚀 Elevated to 10MB to support larger PDFs and documents smoothly
});

// Controllers
const chatController = require('../controllers/chatController');

// Standard Routes Mapping Operations
router.post('/start', authMiddleware, chatController.startConversation);
router.get('/conversations', authMiddleware, chatController.getConversations);
router.post('/message', authMiddleware, chatController.sendMessage);
router.get('/messages/:conversationId', authMiddleware, chatController.getMessages);
router.patch('/seen/:conversationId', authMiddleware, chatController.markAsSeen);

// 🚀 AIRTIGHT SECURE MULTIPART MEDIA & DOCUMENT DISPATCH GATEWAY
router.post('/message/media', authMiddleware, upload.single('chatMedia'), chatController.sendMediaMessage);

// 🗑️ Route to handle soft-deletion of a single message post entry
router.delete('/message/delete/:messageId', authMiddleware, chatController.deleteMessage);

// 🔄 Route to patch / update status delivery flags for double ticks sync
router.patch('/message/status', authMiddleware, chatController.updateMessageStatus);

module.exports = router;