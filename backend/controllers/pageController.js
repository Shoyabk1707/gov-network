const Page = require('../models/Page');

// 1. Create a new Institute/Brand Page
const createPage = async (req, res) => {
  try {
    const { name, category, bio } = req.body;
    const currentUserId = req.user.id ? req.user.id : req.user;

    const newPage = await Page.create({
      name,
      category,
      bio,
      admin: currentUserId // Logged-in user is the owner/admin
    });

    res.status(201).json(newPage);
  } catch (error) {
    console.error('Create Page Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Get all pages managed by the logged-in user
const getUserPages = async (req, res) => {
  try {
    const currentUserId = req.user.id ? req.user.id : req.user;
    const pages = await Page.find({ admin: currentUserId });
    res.json(pages);
  } catch (error) {
    console.error('Get User Pages Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPageById = async (req, res) => {
  try {
    // Model ka naam check kar lena, agar Page hai toh theek hai
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }
    
    res.json(page);
  } catch (err) {
    console.error("Error fetching single page:", err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Page not found' });
    }
    res.status(500).send('Server Error');
  }
};

// FUNCTION: Follow / Unfollow a Page
const followPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // ✨ FIX: String mein convert karke check karna 
    const isFollowing = page.followers.some(
      (userId) => userId.toString() === req.user.id.toString()
    );

    if (isFollowing) {
      // Unfollow: Filter out the user's ID
      page.followers = page.followers.filter(
        (userId) => userId.toString() !== req.user.id.toString()
      );
    } else {
      // Follow: Push the user's ID
      page.followers.push(req.user.id);
    }

    await page.save();
    res.json({ 
      msg: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', 
      followers: page.followers 
    });
  } catch (err) {
    console.error("Error in followPage:", err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Page not found' });
    }
    res.status(500).send('Server Error');
  }
};

module.exports = { createPage, getUserPages, getPageById, followPage };