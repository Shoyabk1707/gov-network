const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification'); 
const socketService = require('../services/socketService'); // 🚀 INJECT CENTRAL ARCHITECTURE SERVICE

// 1. DISCOVER: Get users to connect with (excluding yourself)
router.get('/discover', protect, async (req, res) => {
  try {
    const userId = req.user.id ? req.user.id : req.user;
    
    const users = await User.find({ _id: { $ne: userId } })
                            .select('-password -email') 
                            .limit(50); 
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. FOLLOW / UNFOLLOW TOGGLE MATRIX (FIXED IN STEALTH MODE) 🔄
router.post('/follow/:id', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id ? req.user.id : req.user;
    const targetUserId = req.params.id;

    if (currentUserId.toString() === targetUserId.toString()) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    if (!currentUser.following) currentUser.following = [];
    if (!targetUser.followers) targetUser.followers = [];

    const isAlreadyFollowing = currentUser.following.map(id => id.toString()).includes(targetUserId.toString());

    if (isAlreadyFollowing) {
      // ❌ ALREADY FOLLOWING: Perform UNFOLLOW actions
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());

      await currentUser.save();
      await targetUser.save();

      // 🚀 STEALTH WIPE: Delete the follow notification entry instantly (UNSEND)
      await Notification.deleteOne({
        recipient: targetUserId,
        fromUser: currentUserId.toString(),
        type: 'follow'
      });

      // 💬 SOCKET ENTERPRISE EMIT: Realtime layout synchronization update matrix
      socketService.emitToUser(targetUserId.toString(), 'delete_notification', {
        fromUser: currentUserId.toString(),
        type: 'follow'
      });

      return res.json({ msg: "Successfully unfollowed user", following: currentUser.following });
    } else {
      // 🎯 NOT FOLLOWING YET: Perform FOLLOW actions
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);

      await currentUser.save();
      await targetUser.save();

      try {
        const newNotification = await Notification.create({
          recipient: targetUserId,
          fromUser: currentUserId.toString(),
          type: 'follow',
          message: 'started following you.'
        });

        // 💬 SOCKET ENTERPRISE EMIT: Direct real-time push to private room channel
        socketService.emitToUser(targetUserId.toString(), 'new_notification', {
          _id: newNotification._id,
          type: 'follow',
          fromUser: currentUserId.toString()
        });
      } catch (dbError) {
        // Compound uniqueness constraints lock catches race condition triggers safely here
        console.log("🔒 Unique constraint index layer securely blocked duplicate entry duplication.");
      }

      return res.json({ msg: "Successfully followed user", following: currentUser.following });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. MENTORSHIP BRIDGE: Request Guidance from an Official
router.post('/request-guidance/:id', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id ? req.user.id : req.user;
    const targetUserId = req.params.id;
    const { message } = req.body;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    if (targetUser.role !== 'official') {
        return res.status(400).json({ msg: "You can only request guidance from verified Officials." });
    }

    const alreadyRequested = targetUser.mentorshipRequests.find(
        req => req.fromUser.toString() === currentUserId.toString()
    );

    if (alreadyRequested) {
        return res.status(400).json({ msg: "Guidance request already sent and is pending." });
    }

    targetUser.mentorshipRequests.push({
        fromUser: currentUserId,
        message: message || "I would like to request your professional guidance.",
        status: 'pending'
    });

    await targetUser.save();

    const newNotification = await Notification.create({
      recipient: targetUserId,
      fromUser: currentUserId.toString(),
      type: 'mentorship_request',
      message: 'wants to connect with you for mentorship.'
    });

    // 🚀 SOCKET ENTERPRISE EMIT: Central service alert push
    socketService.emitToUser(targetUserId.toString(), 'new_notification', {
      _id: newNotification._id,
      type: 'mentorship_request',
      fromUser: currentUserId.toString()
    });

    res.json({ msg: "Guidance request sent successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 4. CREATOR PAGE: Get a specific user's public profile AND their posts
router.get('/user/:id', protect, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    const profile = await User.findById(targetUserId).select('-password -email');
    if (!profile) {
      return res.status(404).json({ msg: "User not found" });
    }

    const posts = await Post.find({ user: targetUserId })
                            .populate('user', 'name role') 
                            .sort({ createdAt: -1 });      

    res.json({ 
        profile: profile, 
        posts: posts 
    });
  } catch (err) {
    console.error("Creator Page Error:", err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: "User not found" }); 
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;