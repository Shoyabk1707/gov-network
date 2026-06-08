// backend/middleware/validate.js

const Joi = require('joi');

const validateRegistrationPayload = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().valid('aspirant', 'official', 'creator').default('aspirant')
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.body = value;
  next();
};

// 🚀 ENTERPRISE SYNC: Allowing full validation tracking matching database insertion requirements
const validateOtpPayload = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(3).max(50).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(6).max(30).required(),
    role: Joi.string().valid('aspirant', 'official', 'creator').default('aspirant'),
    otp: Joi.string().length(6).pattern(/^\d+$/).required() // Strict 6 digits check
  });

  const { error, value } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.body = value;
  next();
};

module.exports = { validateRegistrationPayload, validateOtpPayload };