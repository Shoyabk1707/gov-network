const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- CORE REGISTRATION FIELDS (Only these are required now) ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- THE NEW ROLES SYSTEM ---
  role: { 
    type: String, 
    enum: ['aspirant', 'official', 'creator'], 
    default: 'aspirant' 
  },
  isVerified: { type: Boolean, default: false }, // For the blue/green checkmark

  // --- SPECIFIC ROLE FIELDS (To be filled later during Profile Update) ---
  targetExams: { type: [String], default: [] }, // For Aspirants
  department: { type: String, default: '' },    // For Officials
  jobTitle: { type: String, default: '' },      // ✨ NAYA ADD KIYA: For Officials

  // --- PROFILE FIELDS (To be filled later) ---
  tagline: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  bio: { type: String, default: '' },
  targetExams: {
  type: [String], // Array of strings format
  default: []
},
  
  experience: [{
      title: String, company: String, location: String,
      startDate: String, endDate: String, current: Boolean
  }],
  education: [{
      school: String, degree: String, fieldOfStudy: String,
      startYear: String, endYear: String
  }],

  // --- THE NETWORK & MENTORSHIP SYSTEM ---
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  mentorshipRequests: [{
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    message: { type: String } 
  }],
  activeMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activeMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  savedPosts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);