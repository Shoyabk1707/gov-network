// backend/utils/emailService.js
const axios = require('axios');
const { mailConfig, transporter } = require('../config/mailer');

/**
 * Enterprise Gatekeeper: Decides between HTTP API Proxy and Native SMTP Transport Layer
 * @param {Object} options - { from, to, subject, html }
 */
const sendEmail = async (options) => {
  const { from, to, subject, html } = options;

  // 1. Condition Verification Loop: Cloud API Route Active?
  if (mailConfig.useMailApi) {
    try {
      console.log(`📡 Route Selection: Bypassing SMTP. Triggering Proxy Web API Framework...`);
      
      const response = await axios.post(
        mailConfig.api.endpoint,
        { from, to, subject, html }, // Strictly formatted JSON Payload Structure
        {
          headers: {
            'Authorization': `Bearer ${mailConfig.api.key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('🚀 Email Dispatched Successfully via Proxy API Gateway Network Node!');
      return response.data;
    } catch (error) {
      console.error('❌ Proxy API Gateway Pipeline Core Dropped:', error.response?.data || error.message);
      throw new Error('Proxy API Mailer System Error');
    }
  }

  // 2. Fallback Path: Native SMTP Engine Active (For Local Development Node)
  else {
    try {
      console.log(`🔌 Route Selection: API Bridge Disabled. Invoking Native SMTP Transport Loop...`);
      
      if (!transporter) throw new Error('Nodemailer transporter instantiation reference missing');
      
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log('🚀 Email Dispatched Successfully via Native SMTP Mail Pool Instance ID:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Native SMTP Core Handler Interrupted:', error.message);
      throw error;
    }
  }
};

/**
 * Domain Wrapper Hook for Auth Controller Flow
 */
const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: mailConfig.useMailApi ? '"NextGov System" <onboarding@promailer.xyz>' : `"NextGov Network" <${mailConfig.smtp.user}>`,
    to: email,
    subject: '🏛️ NextGov Security: Identity Verification Code',
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 500px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #1e40af;">Verify Your Identity</h2>
        <p style="font-size: 15px; color: #475569;">Welcome to NextGov network node pipeline. Use the signature token below to finalize authentication setup:</p>
        <div style="background: #f1f5f9; padding: 15px 25px; font-size: 28px; font-weight: bold; width: fit-content; letter-spacing: 6px; border-radius: 8px; margin: 20px 0; color: #0f172a;">
          ${otp}
        </div>
        <p style="font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">This verification parameters cluster expires strictly within 5 minutes threshold loop.</p>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

module.exports = { sendEmail, sendOtpEmail };