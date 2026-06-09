// backend/config/mailer.js
const nodemailer = require('nodemailer');

const mailConfig = {
  useMailApi: process.env.USE_MAIL_API === 'true',
  api: {
    endpoint: process.env.PROXY_API_ENDPOINT,
    key: process.env.PROXY_API_KEY
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Lazy initialization pattern: Nodemailer transporter tabhi banega jab API disabled ho
let transporter = null;

if (!mailConfig.useMailApi) {
  transporter = nodemailer.createTransport({
    host: mailConfig.smtp.host,
    port: mailConfig.smtp.port,
    secure: mailConfig.smtp.port === 465,
    auth: {
      user: mailConfig.smtp.user,
      pass: mailConfig.smtp.pass
    },
    tls: {
      rejectUnauthorized: false
    }
  });
}

module.exports = { mailConfig, transporter };