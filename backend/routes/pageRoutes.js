const express = require('express');
const router = express.Router();
const { createPage, getUserPages, getPageById, followPage } = require('../controllers/pageController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPage);
router.get('/my-pages', protect, getUserPages);
router.get('/:id', protect, getPageById);
router.post('/:id/follow', protect, followPage);

module.exports = router;