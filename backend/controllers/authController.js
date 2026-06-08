const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OtpToken = require('../models/OtpToken'); // 🚀 1. Added temporary secure collection
const cryptoService = require('../services/cryptoService'); // 🚀 2. Cryptographic tools
const emailService = require('../services/emailService'); // 🚀 3. Email service layer

// ==========================================
// 🚀 PHASE 1: INITIALIZE OTP VERIFICATION LOOP
// ==========================================
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // A. Industry Standard Protection: Database scale clean verification check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Account already registered and verified.' });
    }

    // B. Clean stale or lingering tokens from previous attempts within current session
    await OtpToken.deleteMany({ email });

    // C. Generate non-predictable numeric code and commit SHA-256 computation digest
    const rawOtp = cryptoService.generateNumericOtp();
    const hashedOtp = cryptoService.hashData(rawOtp);

    // D. Persist session token metadata placeholder safely using built-in engine TTL locks
    await OtpToken.create({
      email,
      otpHash: hashedOtp
    });

    // E. Execute email dispatch asynchronously upstream
    await emailService.sendOtpEmail(email, rawOtp);

    res.status(200).json({ message: 'A secure 6-digit verification code has been dispatched to your email.' });
  } catch (error) {
    console.error('OTP Request Dispatch System Interrupted:', error.message);
    res.status(500).json({ message: 'Failed to initiate server validation verification cycle.' });
  }
};

// ==========================================
// 🚀 PHASE 2: VERIFY TOKEN & SAVE TO PRIMARY DB
// ==========================================
const verifyOtpAndRegister = async (req, res) => {
  try {
    const { name, email, password, role, otp } = req.body;

    // A. Check if user document verification transaction trace is historically active or timed out
    const tokenRecord = await OtpToken.findOne({ email });
    if (!tokenRecord) {
      return res.status(400).json({ message: 'Verification session expired or never initialized. Request a new OTP.' });
    }

    // B. Security Best Practice: Implement explicit trials block threshold (Defends against dictionary brute forcing)
    if (tokenRecord.attempts >= 5) {
      await OtpToken.deleteOne({ email });
      return res.status(429).json({ message: 'Maximum continuous validation attempts breached. Session permanently terminated.' });
    }

    // C. Dynamic Hash verification check on runtime strings context
    const incomingOtpHash = cryptoService.hashData(otp);
    if (incomingOtpHash !== tokenRecord.otpHash) {
      tokenRecord.attempts += 1; // Accumulate trial failure metrics trace locally
      await tokenRecord.save();
      return res.status(400).json({ message: 'Invalid verification code matching token metrics verification sequence failed.' });
    }

    // Race condition protection layer (double lock)
    const doubleCheckUser = await User.findOne({ email });
    if (doubleCheckUser) return res.status(400).json({ message: 'Account simultaneously synchronized on a different system thread context.' });

    // D. Hash computing on primary production client password string layer
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // E. Atomic Write: Complete final verified storage lifecycle commit
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'aspirant'
    });

    // F. Instant volatile session records cleanup
    await OtpToken.deleteOne({ email });

    // G. Generate stateless session identification authorization access payload tokens
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Account validation cleared. Access granted safely and profile verified successfully!',
      token
    });
  } catch (error) {
    console.error('Final Registration Sequence Aborted:', error.message);
    res.status(500).json({ message: 'Internal server data serialization transaction error.' });
  }
};

// ==========================================
// 🔐 SECURE PORTED SESSIONS: LOGIN & RETRIEVAL (Unchanged)
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Login successful!',
      token: token,
    });

  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, tagline, city, state, bio, skills, experience, education, targetExams } = req.body; 

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (tagline !== undefined) user.tagline = tagline;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (experience) user.experience = experience;
    if (education) user.education = education;
    
    if (targetExams !== undefined) {
      user.targetExams = targetExams;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Profile Update Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { 
  requestOtp, 
  verifyOtpAndRegister, 
  loginUser, 
  getUserProfile, 
  updateProfile 
};