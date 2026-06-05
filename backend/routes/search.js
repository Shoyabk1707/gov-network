const express = require('express');
const router = express.Router();
const { globalSearch } = require('../controllers/searchController');
const protect = require('../middleware/authMiddleware');

// GET /api/search?q=your_keyword
router.get('/', protect, globalSearch);

module.exports = router;