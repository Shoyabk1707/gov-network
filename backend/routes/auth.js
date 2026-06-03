const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); 
const User = require('../models/User'); 

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile); 

// Update User Profile
router.put('/profile', protect, async (req, res) => { 
  try {
    // FIX: Because req.user is ALREADY the string ID from the middleware!
    const userId = req.user.id ? req.user.id : req.user; 
    
    const { 
      name, tagline, city, state, bio, skills, experience, education 
    } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { 
          name, tagline, city, state, bio, skills, experience, education 
        } 
      },
      { new: true } 
    ).select('-password'); 

    if (!updatedUser) {
      return res.status(404).send('User not found in database.');
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Profile Update Error:", err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;