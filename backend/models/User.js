const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- THE NEW ROLES SYSTEM ---
  // Default is aspirant. Users can be manually upgraded to official or creator.
  role: { 
    type: String, 
    enum: ['aspirant', 'official', 'creator'], 
    default: 'aspirant' 
  },
  isVerified: { type: Boolean, default: false }, // For the blue/green checkmark
  targetExams: { type: [String], default: [] }, // For Aspirants
  department: { type: String, default: '' }, // For Officials

  // --- PROFILE FIELDS ---
  tagline: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: String, default: '' },
  
  experience: [{
      title: String, company: String, location: String,
      startDate: String, endDate: String, current: Boolean
  }],
  education: [{
      school: String, degree: String, fieldOfStudy: String,
      startYear: String, endYear: String
  }],

  // --- THE NETWORK & MENTORSHIP SYSTEM ---
  // Simple 1-way following (Aspirants following Officials/Creators)
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // 2-way Mentorship Bridge
  mentorshipRequests: [{
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
    message: { type: String } // Optional note when asking for guidance
  }],
  activeMentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  activeMentees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);