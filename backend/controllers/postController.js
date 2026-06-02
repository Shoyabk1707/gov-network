const Post = require('../models/Post');

// 1. Create a new official notice
const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const newPost = await Post.create({
      user: req.user, // Grabbed securely from our auth middleware
      title,
      content,
      category
    });
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// 2. Fetch all notices for the timeline
const getPosts = async (req, res) => {
  try {
    // Finds posts, pulls the creator's name/dept, and sorts by newest first
    const posts = await Post.find()
      .populate('user', 'name department jobTitle')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
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