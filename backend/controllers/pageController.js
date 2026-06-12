const Page = require('../models/Page');

// A. Initialize & Create Page Node
const createPage = async (req, res) => {
  try {
    const { name, bio, about, category, website, location, metadata } = req.body;
    if (!name) return res.status(400).json({ message: 'Page name is required.' });

    const newPage = await Page.create({
      name,
      bio,
      about,
      category,
      website,
      location,
      metadata: metadata || {}, // Auto dump conditional fields grid safely
      owner: req.user
    });

    res.status(201).json(newPage);
  } catch (error) {
    console.error("Create Page Error:", error.message);
    res.status(500).json({ message: 'Server Error initializing page node.' });
  }
};

// B. Fetch All Pages Managed by Current Sessions Local node
const getMyPages = async (req, res) => {
  try {
    const pages = await Page.find({ owner: req.user });
    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching owner pages.' });
  }
};

// C. Fetch Single Page Context Parameters By ID
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).populate('owner', 'name email avatar');
    if (!page) return res.status(404).json({ message: 'Organization page not found.' });
    res.json(page);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching single page index.' });
  }
};

// D. Toggle Follow Connection Matrix Route
const toggleFollowPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ message: 'Page not found.' });

    const userId = req.user;
    const isFollowing = page.followers.includes(userId);

    if (isFollowing) {
      page.followers = page.followers.filter(f => String(f) !== String(userId));
    } else {
      page.followers.push(userId);
    }

    await page.save();
    res.json({ followersCount: page.followers.length, isFollowing: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: 'Server Error managing follow routing loop.' });
  }
};

// E. Update Brand Page Configurations (PUT Action)
const updatePage = async (req, res) => {
  try {
    const { name, category, bio, about, website, location, metadata } = req.body;
    const page = await Page.findById(req.params.id);

    if (!page) return res.status(404).json({ message: 'Page instance not found.' });
    if (String(page.owner) !== String(req.user)) {
      return res.status(401).json({ message: 'Unauthorized profile ownership action.' });
    }

    if (name) page.name = name;
    if (category) page.category = category;
    if (bio !== undefined) page.bio = bio;
    if (about !== undefined) page.about = about;
    if (website !== undefined) page.website = website;
    if (location !== undefined) page.location = location;
    
    // Deeper field validation check before execution
    if (metadata) {
      page.metadata = { ...page.metadata, ...metadata };
    }

    await page.save();
    res.json(page);
  } catch (error) {
    console.error("Update Page Error:", error.message);
    res.status(500).json({ message: 'Server Error processing data updates.' });
  }
};

const getPagePosts = async (req, res) => {
  try {
    // Fetch posts targeting this specific page, sorted by newest first
    // Assuming your Post model has a 'page' field linking to the Page ID
    const Post = require('../models/Post'); 
    const posts = await Post.find({ page: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
      
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching page broadcasts.' });
  }
};

// 📑 backend/controllers/pageController.js me deletePage function ko isse replace kardo:

const deletePage = async (req, res) => {
  try {
    const pageId = req.params.id;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    const pageInstance = await Page.findById(pageId);
    if (!pageInstance) {
      return res.status(404).json({ message: 'Page not found' });
    }

    // Authorization Guard: Strict owner matching chain
    if (pageInstance.owner.toString() !== currentUserId.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this page' });
    }

    // 🔥 CRITICAL CHANGE: Yeh hook cascade trigger ko force karega database clean karne ke liye
    await pageInstance.deleteOne();

    res.json({ message: 'Page and its related posts removed successfully' });
  } catch (error) {
    console.error('Delete Page Error:', error.message);
    res.status(500).json({ message: 'Server Error executing page wipe' });
  }
};

module.exports = { createPage, getMyPages, getPageById, toggleFollowPage, updatePage, getPagePosts, deletePage };