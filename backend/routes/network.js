const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const User = require('../models/User');

// 1. DISCOVER: Get users to connect with (excluding yourself)
router.get('/discover', protect, async (req, res) => {
  try {
    const userId = req.user.id ? req.user.id : req.user;
    
    // Find all users EXCEPT the currently logged-in user
    const users = await User.find({ _id: { $ne: userId } })
                            .select('-password -email') // Hide private info
                            .limit(50); 
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. FOLLOW: 1-Way connection (Aspirants following Creators/Officials)
router.post('/follow/:id', protect, async (req, res) => {
  try {
    const currentUserId = req.user.id ? req.user.id : req.user;
    const targetUserId = req.params.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ msg: "You cannot follow yourself" });
    }

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    // Prevent double-following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ msg: "Already following this user" });
    }

    // Add target to current user's 'following', and current user to target's 'followers'
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ msg: "Successfully followed user", following: currentUser.following });
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

    // Guardrail: Only allow guidance requests to Officials
    if (targetUser.role !== 'official') {
        return res.status(400).json({ msg: "You can only request guidance from verified Officials." });
    }

    // Prevent spamming requests
    const alreadyRequested = targetUser.mentorshipRequests.find(
        req => req.fromUser.toString() === currentUserId.toString()
    );

    if (alreadyRequested) {
        return res.status(400).json({ msg: "Guidance request already sent and is pending." });
    }

    // Add the request to the Official's inbox
    targetUser.mentorshipRequests.push({
        fromUser: currentUserId,
        message: message || "I would like to request your professional guidance.",
        status: 'pending'
    });

    await targetUser.save();

    res.json({ msg: "Guidance request sent successfully!" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;