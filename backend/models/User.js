const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // --- 🔐 CORE REGISTRATION & AUTH FIELDS ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // ✨ FIX: Password required hata diya hai taaki Google Auth smoothly chal sake
  password: { type: String, required: false }, 
  
  // Google Authentication Context Storage
  googleId: { type: String, default: null },
  avatar: { type: String, default: '' }, // User's Google Profile Picture URL

  // --- 🛡️ THE NEW UNIFIED VERIFICATION SUBSYSTEM ---
  verificationStatus: { 
    type: String, 
    enum: ['none', 'pending', 'verified'], 
    default: 'none' 
  },
  verifiedAsOfficial: { type: Boolean, default: false }, // Triggers the core dynamic badge
  officialEmail: { type: String, default: null },       // Verified .gov.in/.nic.in mail
  verificationDocUrl: { type: String, default: null },  // Uploaded ID card link for admin view

  // --- 💼 DYNAMIC PROFILE PAYLOAD (Unified for Everyone) ---
  tagline: { type: String, default: '' }, // e.g., "Preparing for Rajasthan Computer Instructor" or "SDM at Home Department"
  bio: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  department: { type: String, default: '' }, 
  jobTitle: { type: String, default: '' },    
  targetExams: { type: [String], default: [] }, // Anyone can add what they are tracking/cleared

  // Core Sub-Documents Array Matrix
  experience: [{
    title: { type: String },
    company: { type: String },
    location: { type: String },
    startDate: { type: String },
    endDate: { type: String },
    current: { type: Boolean, default: false }
  }],
  
  education: [{
    school: { type: String },
    degree: { type: String },
    fieldOfStudy: { type: String },
    startYear: { type: String },
    endYear: { type: String }
  }],

  // --- 👥 COHORT NETWORK LAYER & CONNECTIONS ---
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Mentorship ecosystem works across any certified nodes now
  mentorshipRequests: [{
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    message: { type: String } 
  }],
  activeMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activeMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);