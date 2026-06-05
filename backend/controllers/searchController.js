const User = require('../models/User');
const Post = require('../models/Post');
const Page = require('../models/Page'); 

// 📌 Global Search functionality
const globalSearch = async (req, res) => {
  try {
    const { q } = req.query; 
    
    // Agar query empty hai, toh khali arrays return kar do
    if (!q || q.trim() === '') {
      return res.json({ users: [], posts: [], pages: [] });
    }

    const regex = new RegExp(q, 'i'); // Case-insensitive match

    // 🚀 Promise.all lagao taaki teeno queries ek sath run hon
    const [users, posts, pages] = await Promise.all([
      User.find({ name: regex }).select('name role jobTitle department tagline').limit(5),
      Post.find({ $or: [{ title: regex }, { content: regex }] }).populate('user', 'name').populate('page', 'name').limit(10),
      Page.find({ $or: [{ name: regex }, { category: regex }] }).limit(5)
    ]);

    res.json({ users, posts, pages });
    
  } catch (error) {
    console.error('Search Error:', error.message);
    res.status(500).json({ message: 'Server Error during search' });
  }
};

module.exports = { globalSearch };