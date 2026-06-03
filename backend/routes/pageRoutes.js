const express = require('express');
const router = express.Router();
const { createPage, getUserPages } = require('../controllers/pageController');
const protect = require('../middleware/authMiddleware');

router.post('/', protect, createPage);
router.get('/my-pages', protect, getUserPages);

module.exports = router;