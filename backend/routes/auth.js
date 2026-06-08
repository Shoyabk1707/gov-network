// backend/routes/auth.js

const express = require('express');
const router = express.Router();
const { 
  requestOtp, 
  verifyOtpAndRegister, 
  loginUser, 
  getUserProfile, 
  updateProfile 
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware'); 
// 🚀 Enforcing accurate validation mappings
const { validateRegistrationPayload, validateOtpPayload } = require('../middleware/validate'); 

// 1. Step 1: Request OTP Initialization Code
router.post('/request-otp', requestOtp);

// 2. Step 2: Validate tokens matching fields configuration
// ✨ FIX HAPPENED HERE: Changed validator to validateOtpPayload
router.post('/verify-otp', validateOtpPayload, verifyOtpAndRegister);

// 3. Independent Login Route
router.post('/login', loginUser);

// 4. Authenticated Session Retrieval Hook
router.get('/me', protect, getUserProfile); 

// 5. Modular Profile Update
router.put('/profile', protect, updateProfile);

module.exports = router;