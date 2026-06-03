const mongoose = require('mongoose');

// This defines the exact structure of a User in our database
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  jobTitle: {
    type: String,
    required: true,
  },
  
  // --- NEW LINKEDIN-STYLE PROFILE FIELDS ---
  tagline: { type: String, default: '' },
  city: { type: String, default: '' }, // e.g., Kota
  state: { type: String, default: '' }, // e.g., Rajasthan
  bio: { type: String, default: '' }, // For the "About" section
  skills: { type: String, default: '' }, // Comma-separated skills
  
  // Experience Array (Allows multiple jobs)
  experience: [{
    title: { type: String },
    company: { type: String },
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    current: { type: Boolean, default: false },
    description: { type: String }
  }],

  // Education Array (Allows multiple schools/degrees)
  education: [{
    school: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startYear: { type: String },
    endYear: { type: String }
  }],

  // Automatically records when the user signed up
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// We turn the schema into a Model and export it so our app can use it
module.exports = mongoose.model('User', userSchema);