const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // --- NEW PROFILE FIELDS ---
  tagline: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: String, default: '' },
  
  // Array to hold multiple jobs
  experience: [
    {
      title: String,
      company: String,
      location: String,
      startDate: String,
      endDate: String,
      current: Boolean
    }
  ],
  
  // Array to hold multiple degrees
  education: [
    {
      school: String,
      degree: String,
      fieldOfStudy: String,
      startYear: String,
      endYear: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);