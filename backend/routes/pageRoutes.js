const express = require('express');
const router = express.Router();
const { createPage, getMyPages, getPageById, toggleFollowPage, updatePage, getPagePosts, deletePage } = require('../controllers/pageController');const protect = require('../middleware/authMiddleware');
const page = require('../models/Page');

// Base Route: /api/pages
router.post('/create', protect, createPage);
router.post('/:id/toggle-follow', protect, toggleFollowPage);

router.get('/my-pages', protect, getMyPages);

router.get('/all', protect, async (req, res) => {
    try {
        const pages = await Page.find({});
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching all nodes' });
    }
});

router.get('/:id', protect, getPageById);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage); // 👈 Yeh line yahan honi chahiye!

router.get('/:id', protect, getPageById);

module.exports = router;