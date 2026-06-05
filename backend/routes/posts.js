const express = require('express');
const router = express.Router();
const { createPost, getPosts, likePost, deletePost, addComment, getPostById, toggleSavePost } = require('../controllers/postController'); 
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/', protect, getPosts);
router.get('/:id', getPostById); 
router.put('/:id/like', protect, likePost); 
router.delete('/:id', protect, deletePost);
router.post('/:id/comment', protect, addComment); 
router.put('/:id/save', protect, toggleSavePost);

module.exports = router;