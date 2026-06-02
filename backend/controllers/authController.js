const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const registerUser = async (req, res) => {
  try {
    // 1. Grab the exact data the user typed into the frontend form
    const { name, email, password, department, jobTitle } = req.body;

    // 2. Check if a user with this official email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Scramble (hash) the password for security
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the new user using our User Model blueprint
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      department,
      jobTitle,
    });

    // 5. Send a success message back to the frontend
    res.status(201).json({
      message: 'User registered successfully!',
      userId: user._id,
    });

  } catch (error) {
    console.error('Registration Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare the typed password with the scrambled one in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Create the digital ID badge (Token)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d', // Badge expires in 1 day
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
    // Fetch user details but exclude the hashed password for safety
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };