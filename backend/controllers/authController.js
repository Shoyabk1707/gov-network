const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  try {
    // 1. Grab exact data from clean frontend payload (including role)
    const { name, email, password, role } = req.body;

    // Validation check for mandatory fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Hash the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || 'aspirant' // Default fallback if role is missing
    });

    // ✨ THE FIX: Save the user to MongoDB database!
    const savedUser = await newUser.save();

    // 5. Send a success message with correct variable reference
    res.status(201).json({
      message: 'User registered successfully!',
      userId: savedUser._id,
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

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

module.exports = { registerUser, loginUser, getUserProfile };