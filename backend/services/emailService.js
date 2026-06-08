const transporter = require('../config/mailer');

class EmailService {
  /**
   * Compiles secure HTML and dispatches verification OTP to user inbox
   */
  async sendOtpEmail(email, otp) {
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-2xl: 12px;">
        <h2 style="color: #1e3a8a; text-align: center;">🏛️ NextGov Verification</h2>
        <p style="font-size: 16px; color: #334155;">Hello,</p>
        <p style="font-size: 16px; color: #334155;">Thank you for registering on NextGov. Use the following cryptographically generated secure One-Time Password (OTP) to complete your verification process. This code is valid for <b>5 minutes</b>:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; tracking-content: 4px; color: #2563eb; background-color: #eff6ff; padding: 10px 30px; border-radius: 8px; border: 1px dashed #bfdbfe;">
            ${otp}
          </span>
        </div>
        <p style="font-size: 14px; color: #64748b;">If you did not initiate this request, please ignore this email safely.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">NextGov Enterprise Secure Ecosystem</p>
      </div>
    `;

    const mailOptions = {
      from: `"NextGov Security" <${process.env.SMTP_USER}>`,
      to: email,
      subject: '🏛️ Secure OTP Verification Code',
      html: htmlTemplate,
    };

    // 🚀 Execution blocks synchronously to handle delivery failures gracefully upstream
    return await transporter.sendMail(mailOptions);
  }
}

module.exports = new EmailService();