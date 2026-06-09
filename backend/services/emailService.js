// backend/services/emailService.js
const axios = require('axios');
const { mailConfig, transporter } = require('../config/mailer');

const sendEmail = async (options) => {
  const { to, subject, html } = options;

  if (mailConfig.useMailApi) {
    try {
      console.log(`📡 Route Selection: Triggering Official Proxy API Subsystem...`);
      
      const response = await axios.post(
        mailConfig.api.endpoint,
        { 
          to: to,
          subject: subject,
          html: html 
        }, 
        {
          headers: {
            'Authorization': `Bearer ${mailConfig.api.key}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // ⏱️ Docs Specification: 60 seconds timeout guard
        }
      );

      console.log('🚀 Email Dispatched Successfully via AutomationLounge Gateway!');
      return response.data;
    } catch (error) {
      if (error.response) {
        console.error('❌ Mail Server Rejected Request:', error.response.data);
      } else {
        console.error('❌ Network Pipeline Error:', error.message);
      }
      throw new Error(`Proxy Mailer API Refused Session: ${error.message}`);
    }
  } else {
    try {
      console.log(`🔌 Route Selection: API Bridge Disabled. Invoking Native SMTP...`);
      if (!transporter) throw new Error('Nodemailer transporter instance missing');
      
      const info = await transporter.sendMail(options);
      console.log('🚀 Email Dispatched Successfully via Native SMTP:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Native SMTP Core Interrupted:', error.message);
      throw error;
    }
  }
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
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