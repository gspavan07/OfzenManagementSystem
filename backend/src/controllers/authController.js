const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, setRefreshCookie } = require('../utils/tokenUtils');

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate('profileId', 'label permissions');

  if (!user || !user.isActive) {
    res.status(401);
    throw new Error('Invalid credentials or account inactive');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  // Save refresh token to DB
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  // Set refresh token as httpOnly cookie
  setRefreshCookie(res, refreshToken);

  res.json({
    success: true,
    accessToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileId: user.profileId?._id,
      profileLabel: user.profileId?.label,
      permissions: user.profileId?.permissions,
    },
  });
});

// ─── POST /api/auth/refresh ────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    res.status(401);
    throw new Error('No refresh token');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select('+refreshToken')
      .populate('profileId', 'label permissions');

    if (!user || user.refreshToken !== token || !user.isActive) {
      res.status(401);
      throw new Error('Invalid refresh token');
    }

    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString());

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, newRefreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileLabel: user.profileId?.label,
        permissions: user.profileId?.permissions,
      },
    });
  } catch (err) {
    res.status(401);
    throw new Error('Invalid or expired refresh token');
  }
});

// ─── POST /api/auth/logout ─────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (token) {
    // Clear refresh token from DB
    const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
    if (user) {
      user.refreshToken = undefined;
      await user.save({ validateBeforeSave: false });
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ success: true, message: 'Logged out successfully' });
});

// ─── GET /api/auth/me ──────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id)
    .select('-password -refreshToken')
    .populate('profileId', 'label permissions');

  res.json({ success: true, user });
});

// ─── PUT /api/auth/me ──────────────────────────────────────────────────────────
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const { name, phone } = req.body;
  if (name) user.name = name;
  if (phone) user.phone = phone;

  const updatedUser = await user.save();
  
  res.json({ 
    success: true, 
    user: {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    } 
  });
});

// ─── PUT /api/auth/me/password ─────────────────────────────────────────────────
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400); throw new Error('Please provide current and new password');
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) { res.status(404); throw new Error('User not found'); }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) { res.status(401); throw new Error('Incorrect current password'); }

  user.password = newPassword;
  await user.save();

  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { login, refreshToken, logout, getMe, updateMe, updatePassword };
