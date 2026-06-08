const rateLimit = require('express-rate-limit');

// Protects registration & verification tracks from flood hits
const otpRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minute tracking window
  max: 3, // Limit each IP to 3 requests per window
  message: {
    message: 'Too many OTP requests generated from this IP. Please try again after 5 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { otpRateLimiter };