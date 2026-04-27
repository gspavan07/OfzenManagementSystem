const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Profile = require('../models/Profile');

// GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const { search, profileId, isActive } = req.query;
  const filter = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (profileId) filter.profileId = profileId;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const users = await User.find(filter)
    .select('-password -refreshToken')
    .populate('profileId', 'label')
    .sort({ createdAt: -1 });

  res.json({ success: true, users });
});

// GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken')
    .populate('profileId', 'label permissions');

  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// POST /api/users
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone, profileId, joinDate } = req.body;

  if (!name || !email || !password || !profileId) {
    res.status(400);
    throw new Error('Name, email, password, and profileId are required');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) { res.status(409); throw new Error('Email already registered'); }

  const profile = await Profile.findById(profileId);
  if (!profile) { res.status(400); throw new Error('Invalid profileId'); }

  const user = await User.create({ name, email, password, phone, profileId, joinDate });
  const populated = await user.populate('profileId', 'label');

  res.status(201).json({ success: true, user: { ...populated.toObject(), password: undefined } });
});

// PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  const { name, phone, profileId, isActive, password } = req.body;
  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (profileId) user.profileId = profileId;
  if (isActive !== undefined) user.isActive = isActive;
  if (password) user.password = password; // pre-save hook will hash

  const updated = await user.save();
  const populated = await updated.populate('profileId', 'label');

  res.json({ success: true, user: { ...populated.toObject(), password: undefined, refreshToken: undefined } });
});

// DELETE /api/users/:id (soft deactivate)
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  user.isActive = false;
  await user.save({ validateBeforeSave: false });
  res.json({ success: true, message: 'User deactivated' });
});

module.exports = { getUsers, getUserById, createUser, updateUser, deactivateUser };
