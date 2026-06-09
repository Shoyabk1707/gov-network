const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: '74.125.141.108', // Direct standard IP mapping for smtp.gmail.com
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // 587 uses false, then upgrades via STARTTLS
  pool: true, 
  maxConnections: 5, 
  maxMessages: 100, 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) console.error('❌ SMTP Pool Error:', error.message);
  else console.log('🚀 SMTP Pool Connection Secured Successfully');
});

module.exports = transporter;