const Page = require('../models/Page');
const mongoose = require('mongoose');

// 1. Create a new Institute/Brand Page
const createPage = async (req, res) => {
  try {
    const { name, category, bio } = req.body;
    
    let userId;
    if (typeof req.user === 'string') userId = req.user;
    else if (req.user && req.user.id) userId = req.user.id;
    else if (req.user && req.user._id) userId = req.user._id;

    if (!userId) {
      console.log("Error: User auth object is invalid");
      return res.status(400).json({ message: 'Authentication error' });
    }

    const newPage = await Page.create({
      name,
      category,
      bio,
      admin: userId // Ab yeh pakka save hoga
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
    // 🚨 BULLETPROOF ID EXTRACTION
    let userId;
    if (typeof req.user === 'string') userId = req.user;
    else if (req.user && req.user.id) userId = req.user.id;
    else if (req.user && req.user._id) userId = req.user._id;

    const pages = await Page.find({ admin: userId }).sort({ createdAt: -1 });
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

// Follow / Unfollow a Page 
const followPage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ msg: 'Page not found' });
    }

    // 1. Get exact User ID
    let userId = req.user._id || req.user.id || req.user;
    
    // 2. Convert string to pure MongoDB ObjectId (Yeh sabse zaroori tha!)
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // 3. Check if following
    const isFollowing = page.followers.some(
      (follower) => follower.toString() === userId.toString()
    );

    let updatedPage;

    if (isFollowing) {
      // 🚨 DIRECT DB WRITE: Remove user
      updatedPage = await Page.findByIdAndUpdate(
        page._id, 
        { $pull: { followers: userObjectId } },
        { new: true } // Returns the updated document
      );
    } else {
      // 🚨 DIRECT DB WRITE: Add user
      updatedPage = await Page.findByIdAndUpdate(
        page._id, 
        { $addToSet: { followers: userObjectId } },
        { new: true }
      );
    }

    res.json({ 
      msg: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', 
      followers: updatedPage.followers 
    });
  } catch (err) {
    console.error("🔥 Error in followPage:", err);
    res.status(500).send('Server Error');
  }
};

// Get ALL pages for the "Discover" section
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });
    res.json(pages);
  } catch (error) {
    console.error('Get All Pages Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createPage, getUserPages, getPageById, followPage, getAllPages };