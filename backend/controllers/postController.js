const Post = require('../models/Post');
const User = require('../models/User');

// Create a new post (Personal OR Page Post)
const createPost = async (req, res) => {
  try {
    const { title, content, category, pageId } = req.body;
    const currentUserId = req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : req.user.toString());

    const postData = {
      user: currentUserId, 
      title,
      content,
      category,
      page: pageId ? pageId : null 
    };

    const newPost = await Post.create(postData);

    const populatedPost = await Post.findById(newPost._id)
                                    .populate('user', 'name role jobTitle department')
                                    .populate('page', 'name category'); 

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

    const posts = await Post.find({})
                            .populate('user', 'name role jobTitle department') 
                            .populate('page', 'name category')                 
                            .populate('comments.user', 'name role jobTitle department')
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

// 4. Delete a post (NATIVE MONGOOSE EQUALS MATCH)
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserDoc = req.user._id ? req.user._id : (req.user.id ? req.user.id : req.user);
    const postAuthorDoc = post.user._id ? post.user._id : post.user;

    console.log("--- DEBUGGING DELETE MATCH ---");
    const isAuthorized = postAuthorDoc.toString() === currentUserDoc.toString();
    console.log("Is Authorized Outcome:", isAuthorized);
    console.log("------------------------------");

    if (!isAuthorized) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully', postId: req.params.id });
  } catch (error) {
    console.error('Delete Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 5. Add a comment to a post
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const currentUserId = req.user._id ? req.user._id.toString() : (req.user.id ? req.user.id.toString() : req.user.toString());

    // Naya comment ka object array me push karo
    const newComment = {
      user: currentUserId,
      text: text
    };

    post.comments.push(newComment);
    await post.save();

    // Freshly updated post ko poore comment users ke 'name role' ke sath populate karo
    const updatedPost = await Post.findById(req.params.id)
                                  .populate('user', 'name role jobTitle department')
                                  .populate('page', 'name category')
                                  .populate('comments.user', 'name role jobTitle department'); // ✨ Comment karne wale ka data

    res.json(updatedPost.comments); // Sirf updated comments ka array return karenge frontend ko
  } catch (error) {
    console.error('Comment Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

// 6. Get a single post by ID (For shared links & single view)
const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
                            .populate('user', 'name role jobTitle department')
                            .populate('page', 'name category')
                            .populate('comments.user', 'name role jobTitle department');

    if (!post) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get Single Post Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

// ✨ FIXED: Added deletePost in exports array here!
module.exports = { createPost, getPosts, likePost, deletePost, addComment, getPostById };