const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  pool: true, 
  maxConnections: 5, 
  maxMessages: 100, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // 🚀 ENTERPRISE LOCAL FIX: Allow self-signed certificates in dev/testing environments
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) console.error('❌ SMTP Pool Error:', error.message);
  else console.log('🚀 SMTP Pool Connection Secured Successfully');
});

module.exports = transporter;