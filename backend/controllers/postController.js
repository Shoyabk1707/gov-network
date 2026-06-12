const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createPost = async (req, res) => {
  try {
    const { content, category, pageId, postType } = req.body;
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Content is required to create a post' });
    }

    const newPost = await Post.create({
      // Agar post page ke throw ho rahi hai, toh user ref ko structural context ke liye rakh sakte hain, 
      // par identity check main field 'page' hi sambhalegi
      user: currentUserId.toString(),
      content,
      // ✨ Dono side same simple dynamic values assign ho rahi hain
      category: postType || category || 'General',
      page: pageId || null
    });

    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'name role jobTitle department')
      .populate('page', 'name category');

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Create Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('user', 'name role jobTitle department')
      .populate('page', 'name category')
      .populate('comments.user', 'name role jobTitle department')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Feed Error:", err.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.likes) post.likes = [];

    const userIdStr = (req.user._id || req.user.id || req.user).toString();
    const index = post.likes.findIndex(id => id.toString() === userIdStr);

    if (index > -1) {
      post.likes.splice(index, 1);
    } else {
      post.likes.push(userIdStr);

      // ✨ REAL-TIME TRIGGER: Agar doosre user ki post hai, toh notification insert karo
      if (post.user && post.user.toString() !== userIdStr) {
        await Notification.create({
          recipient: post.user, // Post likhne wala user
          fromUser: userIdStr,  // Like karne wala user
          type: 'like',
          postId: post._id,
          message: 'liked your post.'
        });
      }
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Like Error:', error.message); 
    res.status(500).json({ message: 'Server Error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const currentUserDoc = req.user._id || req.user.id || req.user;
    const postAuthorDoc = post.user?._id || post.user;

    if (postAuthorDoc.toString() !== currentUserDoc.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully', postId: req.params.id });
  } catch (error) {
    console.error('Delete Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const currentUserId = req.user._id || req.user.id || req.user;

    post.comments.push({
      user: currentUserId.toString(),
      text: text
    });
    
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'name role jobTitle department');

    res.json(updatedPost.comments);
  } catch (error) {
    console.error('Comment Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name role jobTitle department')
      .populate('page', 'name category')
      .populate('comments.user', 'name role jobTitle department');

    if (!post) return res.status(404).json({ message: 'Notice not found' });

    res.json(post);
  } catch (error) {
    console.error('Get Single Post Error:', error.message);
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Notice not found' });
    res.status(500).json({ message: 'Server Error' });
  }
};

const toggleSavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id || req.user.id || req.user; 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isSaved = user.savedPosts?.some(id => id.toString() === postId.toString());

    if (isSaved) {
      await User.findByIdAndUpdate(userId, { $pull: { savedPosts: postId } });
      return res.json({ message: 'Notice removed from saved list' });
    } else {
      await User.findByIdAndUpdate(userId, { $addToSet: { savedPosts: postId } });
      return res.json({ message: 'Notice saved successfully 🔖' });
    }
  } catch (error) {
    console.error('Save Post Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getSavedPosts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id || req.user; 
    
    const user = await User.findById(userId).populate({
      path: 'savedPosts',
      populate: [
        { path: 'user', select: 'name role jobTitle department' },
        { path: 'page', select: 'name category' }
      ]
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user.savedPosts.reverse());
  } catch (error) {
    console.error('Get Saved Posts Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getPagePosts = async (req, res) => {
  try {
    // URL se Page ID nikal kar query chalayi
    const posts = await Post.find({ page: req.params.id })
      .populate('user', 'name role jobTitle department')
      .populate('page', 'name category')
      .sort({ createdAt: -1 }); // Newest posts first

    res.json(posts);
  } catch (error) {
    console.error("Get Page Posts Error:", error.message);
    res.status(500).json({ message: 'Server Error fetching page posts' });
  }
};

module.exports = { 
  createPost, 
  getPosts, 
  getPagePosts, 
  likePost, 
  deletePost, 
  addComment, 
  getPostById, 
  toggleSavePost, 
  getSavedPosts 
};