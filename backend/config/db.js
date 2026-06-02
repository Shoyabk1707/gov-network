const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This looks for the secret link in your .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected Successfully!');
  } catch (error) {
    console.error('MongoDB Connection Failed:', error.message);
    process.exit(1); // Stops the server if it fails
  }
};

module.exports = connectDB;