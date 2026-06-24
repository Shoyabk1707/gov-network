const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Cloudinary Credentials Lock
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setup Cloudinary Storage Rules Matrix
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'gov_network_media', // Cloudinary par kis folder me store hoga
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'webp', 'gif',], // Dynamic formats lock
    transformation: [{ width: 1024, quality: 'auto' }],
    resource_type: 'auto' // Images aur documents dono auto-detect ho sakein
  }
});

const upload = multer({ storage: storage });

module.exports = { upload, cloudinary };