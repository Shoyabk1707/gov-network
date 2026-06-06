const express = require('express');
const router = express.Router();
const { createPage, getUserPages, getPageById, followPage, getAllPages } = require('../controllers/pageController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPage);
router.get('/my-pages', protect, getUserPages);
router.get('/:id', protect, getPageById);
router.post('/:id/follow', protect, followPage);
router.get('/all', protect, getAllPages);

module.exports = router;