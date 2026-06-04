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

    // 3. ✨ FIXED TYPO: Changed newPage._id to newPost._id AND added jobTitle, department
    const populatedPost = await Post.findById(newPost._id)
                                    .populate('user', 'name role jobTitle department')
                                    .populate('page', 'name category'); // Also pull brand name if it's a page post

    console.log("📡 BACKEND SENDING THIS NEW POST DATA:", populatedPost);
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Fetch all notices for the timeline (UPDATED FOR PAGES)
const getPosts = async (req, res) => {
  try {
    const currentUserId = req.user._id ? req.user._id.toString() : 
                          req.user.id ? req.user.id.toString() : 
                          req.user.toString();
    
    console.log("---- FEED ALGORITHM RUNNING WITH PAGES ----");

    // Abhi ke liye hum saari posts dikhayenge taaki brand pages ki notifications har aspirant/user ko instantly timeline par mile
    const posts = await Post.find({})
                            .populate('user', 'name role jobTitle department') // Grabs user details
                            .populate('page', 'name category')                 // ✨ DETECT & POPULATE THE INSTUTUTE PAGE
                            .sort({ createdAt: -1 });

    console.log(`Successfully found ${posts.length} total posts on timeline.`);
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
    console.error('Like Error:', error.message); 
    res.status(500).json({ message: 'Server Error' });
  }
};

// 4. Delete a post (Personal or Page Post) - FIXED SECURITY MATCH
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : req.user.toString());

    // ✨ BULLETPROOF MATCH: Extracted nested ID handle checking if user field is populated object or raw ObjectId string
    const postAuthorId = post.user._id ? post.user._id.toString() : post.user.toString();

    console.log("Comparing IDs -> Author:", postAuthorId, " | LoggedIn:", currentUserId);

    // Security Check
    if (postAuthorId !== currentUserId) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully', postId: req.params.id });
  } catch (error) {
    console.error('Delete Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createPost, getPosts, likePost };