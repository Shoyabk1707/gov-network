const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Get token from the header
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No badge, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id; // Attach user ID to the request object
    next(); // Move to the next function
  } catch (err) {
    res.status(401).json({ message: 'Badge is not valid' });
  }
};