const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OtpToken = require('../models/OtpToken'); 
const cryptoService = require('../services/cryptoService'); 
const emailService = require('../services/emailService'); 
const { OAuth2Client } = require('google-auth-library');

// Initialize Google Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

// ==========================================
// 🚀 PHASE 1: INITIALIZE OTP VERIFICATION LOOP
// ==========================================
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Account already registered and verified.' });

    await OtpToken.deleteMany({ email });
    const rawOtp = cryptoService.generateNumericOtp();
    const hashedOtp = cryptoService.hashData(rawOtp);

    await OtpToken.create({ email, otpHash: hashedOtp });
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
    const { name, email, password, otp } = req.body;

    const tokenRecord = await OtpToken.findOne({ email });
    if (!tokenRecord) return res.status(400).json({ message: 'Verification session expired or never initialized. Request a new OTP.' });

    if (tokenRecord.attempts >= 5) {
      await OtpToken.deleteOne({ email });
      return res.status(429).json({ message: 'Maximum continuous validation attempts breached. Session permanently terminated.' });
    }

    const incomingOtpHash = cryptoService.hashData(otp);
    if (incomingOtpHash !== tokenRecord.otpHash) {
      tokenRecord.attempts += 1; 
      await tokenRecord.save();
      return res.status(400).json({ message: 'Invalid verification code matching token metrics verification sequence failed.' });
    }

    const doubleCheckUser = await User.findOne({ email });
    if (doubleCheckUser) return res.status(400).json({ message: 'Account simultaneously synchronized on a different system thread context.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    await OtpToken.deleteOne({ email });
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
// 🔐 GOOGLE AUTHENTICATION INTEGRATION
// ==========================================
const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture: avatar } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
      });
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    const authToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Google Authentication successful!',
      token: authToken,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ message: 'Google Authentication failed.' });
  }
};

// ==========================================
// 🔐 SECURE PORTED SESSIONS: LOGIN & RETRIEVAL
// ==========================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid credentials or please login with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful!', token });
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
    const { name, tagline, city, state, bio, skills, experience, education, targetExams, department, jobTitle } = req.body; 

    const user = await User.findById(req.user || req.user.id || req.user._id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (tagline !== undefined) user.tagline = tagline;
    if (city !== undefined) user.city = city;
    if (state !== undefined) user.state = state;
    if (bio !== undefined) user.bio = bio;
    if (skills !== undefined) user.skills = skills;
    if (department !== undefined) user.department = department;
    if (jobTitle !== undefined) user.jobTitle = jobTitle;
    if (experience) user.experience = experience;
    if (education) user.education = education;
    if (targetExams !== undefined) user.targetExams = targetExams;

    await user.save();
    res.json(user);
  } catch (err) {
    console.error("Profile Update Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// 🔥 EXTRACTED & SOLIDIFIED IMAGE MATRIX CONTROLLER
const updateProfilePicture = async (req, res) => {
  try {
    const currentUserId = req.user?._id || req.user?.id || req.user;

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const imageUrl = req.file.path; 

    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { $set: { avatar: imageUrl } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: "User index matching context not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Profile picture synced successfully!",
      avatar: updatedUser.avatar
    });
  } catch (error) {
    console.error("Avatar Upload Controller Execution Error:", error.message);
    return res.status(500).json({ message: "Server Error uploading profile image matrix." });
  }
};

// Clean structural multi-point naming boundaries export
module.exports = { 
  requestOtp, 
  verifyOtpAndRegister, 
  googleAuth, 
  loginUser, 
  getUserProfile, 
  updateProfile,
  updateProfilePicture
};