const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  const queryToken = req.query.token;
  if (!header?.startsWith('Bearer ') && !queryToken) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = queryToken || header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    if (!req.user.isEnabled) return res.status(403).json({ message: 'Account is disabled' });
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

module.exports = { protect, adminOnly };
