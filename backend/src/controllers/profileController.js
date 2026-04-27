const asyncHandler = require('express-async-handler');
const Profile = require('../models/Profile');
const User = require('../models/User');

// GET /api/profiles
const getProfiles = asyncHandler(async (req, res) => {
  const profiles = await Profile.find().sort({ isDefault: -1, label: 1 });
  res.json({ success: true, profiles });
});

// GET /api/profiles/:id
const getProfileById = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id);
  if (!profile) { res.status(404); throw new Error('Profile not found'); }
  res.json({ success: true, profile });
});

// POST /api/profiles
const createProfile = asyncHandler(async (req, res) => {
  const { label, permissions } = req.body;
  if (!label) { res.status(400); throw new Error('Profile label is required'); }

  const profile = await Profile.create({ label, permissions: permissions || {}, isDefault: false });
  res.status(201).json({ success: true, profile });
});

// PUT /api/profiles/:id
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id);
  if (!profile) { res.status(404); throw new Error('Profile not found'); }

  const { label, permissions } = req.body;
  if (label) profile.label = label;
  if (permissions) profile.permissions = permissions;

  const updated = await profile.save();
  res.json({ success: true, profile: updated });
});

// DELETE /api/profiles/:id
const deleteProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findById(req.params.id);
  if (!profile) { res.status(404); throw new Error('Profile not found'); }
  if (profile.isDefault) { res.status(400); throw new Error('Cannot delete a default system profile'); }

  // Check no users are assigned
  const usersWithProfile = await User.countDocuments({ profileId: profile._id });
  if (usersWithProfile > 0) {
    res.status(400);
    throw new Error(`Cannot delete — ${usersWithProfile} user(s) are assigned this profile`);
  }

  await profile.deleteOne();
  res.json({ success: true, message: 'Profile deleted' });
});

// POST /api/profiles/:id/clone
const cloneProfile = asyncHandler(async (req, res) => {
  const original = await Profile.findById(req.params.id);
  if (!original) { res.status(404); throw new Error('Profile not found'); }

  const cloneLabel = req.body.label || `${original.label} (Copy)`;
  const cloned = await Profile.create({
    label: cloneLabel,
    isDefault: false,
    permissions: original.permissions.toObject(),
  });

  res.status(201).json({ success: true, profile: cloned });
});

// PUT /api/profiles/assign — assign profile to a user
const assignProfileToUser = asyncHandler(async (req, res) => {
  const { userId, profileId } = req.body;
  if (!userId || !profileId) { res.status(400); throw new Error('userId and profileId are required'); }

  const [user, profile] = await Promise.all([
    User.findById(userId),
    Profile.findById(profileId),
  ]);

  if (!user) { res.status(404); throw new Error('User not found'); }
  if (!profile) { res.status(404); throw new Error('Profile not found'); }

  user.profileId = profileId;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: `Profile "${profile.label}" assigned to ${user.name}` });
});

module.exports = {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile,
  cloneProfile,
  assignProfileToUser,
};
