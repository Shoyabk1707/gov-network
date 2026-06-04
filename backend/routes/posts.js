const express = require('express');
const router = express.Router();
// 1. FIXED: Added deletePost inside the controller destructuring array
const { createPost, getPosts, likePost, deletePost } = require('../controllers/postController'); 
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.put('/:id/like', protect, likePost); 
// 2. FIXED: Changed authMiddleware to protect, so it matches the top import
router.delete('/:id', protect, deletePost);

module.exports = router;