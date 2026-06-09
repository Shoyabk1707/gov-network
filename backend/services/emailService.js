// backend/utils/emailService.js
const config = require('../config/mailer');

const sendOtpEmail = async (email, otp) => {
  try {
    // 🏛️ Real-world production API trigger bypassing traditional cloud firewalls
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev', // Resend free tier standard default sender domain
        to: email,
        subject: '🏛️ NextGov Security: Identity Verification Code',
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2>Verify Your Identity</h2>
            <p>Welcome to NextGov network node pipeline. Use the signature token below to finalize authentication setup:</p>
            <h1 style="background: #f1f5f9; padding: 10px 20px; width: fit-content; letter-spacing: 4px; border-radius: 8px;">${otp}</h1>
            <p>This verification parameters cluster expires strictly within 5 minutes threshold loop.</p>
          </div>
        `
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Resend API pipeline drop error');
    }

    console.log('🚀 High-Grade Verification Email Dispatched Safely via Resend API Node!');
    return true;
  } catch (error) {
    console.error('❌ Resend Mailer Core Interrupted:', error.message);
    throw error;
  }
};

module.exports = { sendOtpEmail };