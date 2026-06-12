const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  about: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['Coaching Institute', 'Content Creator', 'Publisher', 'Other'], 
    default: 'Coaching Institute' 
  },
  website: { type: String, default: '' },
  location: { type: String, default: '' },
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  
  // ✨ THE DYNAMIC METADATA OPEN BLOCK (Required: false for super smooth testing)
  metadata: {
    pageType: { type: String, default: '' },       // 'creator' or 'institute'
    primaryNiche: { type: String, default: '' },   // For Creators
    socialLinks: { type: String, default: '' },    // For Creators
    registrationId: { type: String, default: '' }, // For Institutes
    headquarters: { type: String, default: '' }    // For Institutes
  },

  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

PageSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    const Post = mongoose.model('Post');
    await Post.deleteMany({ page: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Page', PageSchema);