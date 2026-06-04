const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, deletePost, addComment } = require('../controllers/postController'); 
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.put('/:id/like', protect, likePost); 
router.delete('/:id', protect, deletePost);
router.post('/:id/comment', protect, addComment);

module.exports = router;