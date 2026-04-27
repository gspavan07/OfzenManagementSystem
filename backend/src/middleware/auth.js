const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

/**
 * Verifies JWT access token from Authorization header or cookie.
 * Attaches req.user = { id, name, email, permissions } for downstream use.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Support Bearer token in header
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: httpOnly cookie
  else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — no token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user with their profile (to get permissions)
    const user = await User.findById(decoded.id)
      .select('-password -refreshToken')
      .populate('profileId', 'label permissions')
      .lean();

    if (!user || !user.isActive) {
      res.status(401);
      throw new Error('Not authorized — user not found or inactive');
    }

    // Attach to request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profileId: user.profileId?._id?.toString(),
      profileLabel: user.profileId?.label,
      permissions: user.profileId?.permissions || {},
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(401);
      throw new Error('Token expired');
    }
    res.status(401);
    throw new Error('Not authorized — invalid token');
  }
});

module.exports = { protect };
