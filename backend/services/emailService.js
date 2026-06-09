// backend/services/emailService.js
const axios = require('axios');
const { mailConfig, transporter } = require('../config/mailer');

const sendEmail = async (options) => {
  const { from, to, subject, html } = options;

  if (mailConfig.useMailApi) {
    try {
      console.log(`📡 Route Selection: Triggering Proxy Web API Framework...`);
      console.log(`🔗 Destination Node: ${mailConfig.api.endpoint}`);
      
      // ProMailer API dynamic request execution structure
      const response = await axios.post(
        mailConfig.api.endpoint,
        { 
          // Payload matching ProMailer pipeline specs
          from: from,
          to: to,
          subject: subject,
          html: html 
        }, 
        {
          headers: {
            // Standard dual-mapping for token verification
            'X-API-Key': mailConfig.api.key,
            'Authorization': `Bearer ${mailConfig.api.key}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('🚀 Email Dispatched Successfully via Proxy API Gateway Network Node!');
      return response.data;
    } catch (error) {
      // Is isolated logging block se Render logs par clear ho jayega ki kya dikkat hai
      if (error.response) {
        console.error('❌ ProMailer Server Responded with Error Data:', error.response.data);
        console.error('❌ Status Code Received:', error.response.status);
      } else if (error.request) {
        console.error('❌ No Response Received from Proxy Gateway Network Object:', error.request);
      } else {
        console.error('❌ Axios Pipeline Processing Trigger Error:', error.message);
      }
      throw new Error(`Proxy API System Execution Failure: ${error.message}`);
    }
  } else {
    try {
      console.log(`🔌 Route Selection: API Bridge Disabled. Invoking Native SMTP Transport Loop...`);
      if (!transporter) throw new Error('Nodemailer transporter instantiation reference missing');
      
      const info = await transporter.sendMail({ from, to, subject, html });
      console.log('🚀 Email Dispatched Successfully via Native SMTP Instance:', info.messageId);
      return info;
    } catch (error) {
      console.error('❌ Native SMTP Core Handler Interrupted:', error.message);
      throw error;
    }
  }
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    // ProMailer requires authenticated source address matching the connection profile
    from: `"NextGov System" <tuber9160@gmail.com>`, 
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