const Page = require('../models/Page');

// 1. CREATE PAGE FUNCTION
const createPage = async (req, res) => {
  try {
    const { name, category, bio } = req.body;
    
    // Safely get user ID
    const userId = req.user._id || req.user.id;

    const newPage = new Page({
      name,
      category,
      bio,
      admin: userId // ✨ FIX: 'user' ki jagah 'admin' save kar rahe hain
    });

    const page = await newPage.save();
    res.json(page);
  } catch (err) {
    console.error("Error creating page:", err.message);
    res.status(500).send('Server Error');
  }
};

// 2. GET USER'S PAGES FUNCTION
const getUserPages = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    // ✨ FIX: Database mein 'admin' field se dhoondh rahe hain
    const pages = await Page.find({ admin: userId }).sort({ createdAt: -1 });
    
    res.json(pages);
  } catch (err) {
    console.error("Error fetching user pages:", err.message);
    res.status(500).send('Server Error');
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

    // Middleware se user id nikalna (kabhi _id hota hai, kabhi id)
    const userId = req.user._id || req.user.id;

    // Safely check if user exists in followers array
    const isFollowing = page.followers.some(
      (follower) => follower.toString() === userId.toString()
    );

    if (isFollowing) {
      // 🚀 MONGOOSE MAGIC: $pull safely removes the ID
      await Page.findByIdAndUpdate(page._id, { $pull: { followers: userId } });
    } else {
      // 🚀 MONGOOSE MAGIC: $addToSet safely adds without duplicates
      await Page.findByIdAndUpdate(page._id, { $addToSet: { followers: userId } });
    }

    // Naya updated page fetch karke return karna
    const updatedPage = await Page.findById(page._id);

    res.json({ 
      msg: isFollowing ? 'Unfollowed successfully' : 'Followed successfully', 
      followers: updatedPage.followers 
    });
  } catch (err) {
    console.error("Error in followPage:", err);
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