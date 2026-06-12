const express = require('express');
const router = express.Router();
const { createPage, getMyPages, getPageById, toggleFollowPage, updatePage, deletePage } = require('../controllers/pageController');
const { getPagePosts } = require('../controllers/postController'); // 👈 Post controller se pull kiya
const protect = require('../middleware/authMiddleware');

// Base Route: /api/pages
router.post('/create', protect, createPage);
router.post('/:id/toggle-follow', protect, toggleFollowPage);

router.get('/my-pages', protect, getMyPages);

router.get('/all', protect, async (req, res) => {
    try {
        const Page = require('../models/Page'); // Schema definition boundary safe resolution
        const pages = await Page.find({});
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: 'Server Error fetching all nodes' });
    }
});

// ✨ DYNAMIC ROUTING GRID PARAMETERS
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage); 
router.get('/:id/posts', protect, getPagePosts); 
router.get('/:id', protect, getPageById);

module.exports = router;