const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); // Import middleware

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getUserProfile); // Protected route!

module.exports = router;