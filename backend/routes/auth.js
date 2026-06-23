const express = require('express');
const router = express.Router();
const { 
  requestOtp, 
  verifyOtpAndRegister, 
  googleAuth,
  loginUser, 
  getUserProfile, 
  updateProfile,
  updateProfilePicture // 👈 1. Is naye controller ko import karo (Niche banayenge)
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); 
const { validateRegistrationPayload, validateOtpPayload } = require('../middleware/validate'); 
const { upload } = require('../config/cloudinaryConfig'); // 👈 2. Cloudinary wrapper upload function import karo

// 1. Step 1: Request OTP Initialization Code
router.post('/request-otp', requestOtp);

// 2. Step 2: Validate tokens matching fields configuration
router.post('/verify-otp', validateOtpPayload, verifyOtpAndRegister);

// ✨ Google Auth Route
router.post('/google', googleAuth);

// 3. Independent Login Route
router.post('/login', loginUser);

// 4. Authenticated Session Retrieval Hook
router.get('/me', protect, getUserProfile); 

// 5. Modular Profile Update
router.put('/profile', protect, updateProfile);

// 🔥 3. NEW INDUSTRIAL MULTIPART ROUTE: Profile Pic Upload
// protect session check karega, upload.single('avatar') image file Cloudinary bhejega
router.post('/update-avatar', protect, upload.single('avatar'), updateProfilePicture);

module.exports = router;