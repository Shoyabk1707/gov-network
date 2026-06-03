const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); // Import middleware

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile); // Protected route!

// Update User Profile
// Update User Profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      name, tagline, city, state, bio, skills, experience, education 
    } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 
          name, tagline, city, state, bio, skills, experience, education 
        } 
      },
      { new: true } 
    ).select('-password'); 

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;