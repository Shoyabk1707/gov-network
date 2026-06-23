const express = require('express');
const router = express.Router();
const { 
  createPost, 
  getPosts, 
  likePost, 
  deletePost, 
  addComment, 
  getPostById, 
  toggleSavePost, 
  getSavedPosts 
} = require('../controllers/postController'); 
const protect = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinaryConfig'); // 👈 Cloudinary layer import

router.post('/', protect, upload.single('postImage'), createPost); 
router.get('/', protect, getPosts);
router.get('/saved', protect, getSavedPosts);
router.get('/:id', getPostById); 
router.put('/:id/like', protect, likePost); 
router.delete('/:id', protect, deletePost);
router.post('/:id/comment', protect, addComment); 
router.put('/:id/save', protect, toggleSavePost);

module.exports = router;