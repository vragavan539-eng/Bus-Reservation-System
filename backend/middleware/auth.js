const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) { res.status(401); throw new Error('Not authorized, no token'); }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) { res.status(401); throw new Error('User not found'); }
    if (req.user.isBlocked) { res.status(403); throw new Error('Account is blocked'); }
    next();
  } catch (err) { res.status(401); throw new Error('Not authorized, token failed'); }
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) { res.status(403); throw new Error('Not authorized for this role'); }
  next();
};