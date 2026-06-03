const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post (Personal OR Page Post)
const createPost = async (req, res) => {
  try {
    // 1. Destructure pageId along with title, content, and category
    const { title, content, category, pageId } = req.body;
    const currentUserId = req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : req.user.toString());

    // 2. Build the database object payload
    const postData = {
      user: currentUserId, // Author remains the authenticated user
      title,
      content,
      category,
      page: pageId ? pageId : null // If pageId is provided, link it. Otherwise, personal post.
    };

    const newPost = await Post.create(postData);

    // 3. Populate user info so the frontend receives author names instantly
    const populatedPost = await Post.findById(newPage._id)
                                    .populate('user', 'name role')
                                    .populate('page', 'name category'); // Also pull brand name if it's a page post

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Fetch all notices for the timeline
const getPosts = async (req, res) => {
  try {
    // 1. Bulletproof ID extraction (handles String, Object, or Mongoose Document)
    const currentUserId = req.user._id ? req.user._id.toString() : 
                          req.user.id ? req.user.id.toString() : 
                          req.user.toString();
    
    console.log("---- FEED ALGORITHM RUNNING ----");
    console.log("Logged in User ID:", currentUserId);

    // 2. Find the current user to get their 'following' list
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res.status(404).json({ msg: "User not found" });
    }

    // 3. Create the filter array and ensure everything is a clean string
    const followingIds = currentUser.following.map(id => id.toString());
    const targetIds = [...followingIds, currentUserId];
    
    console.log("Fetching posts for these IDs:", targetIds);

    // 4. Query the database, sort by newest, AND get the author's name/role!
    const posts = await Post.find({ user: { $in: targetIds } })
                            .populate('user', 'name role') // Grabs author details
                            .sort({ createdAt: -1 });

    console.log(`Successfully found ${posts.length} filtered posts.`);
    console.log("--------------------------------");

    res.json(posts);
  } catch (err) {
    console.error("Feed Error:", err.message);
    res.status(500).send('Server Error');
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // FIX: If the old post doesn't have a likes array yet, create it empty
    if (!post.likes) {
      post.likes = [];
    }

    const alreadyLiked = post.likes.includes(req.user);

    if (alreadyLiked) {
      post.likes = post.likes.filter(userId => userId.toString() !== req.user);
    } else {
      post.likes.push(req.user);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Like Error:', error.message); // This prints the error in your terminal
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createPost, getPosts, likePost };