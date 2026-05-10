const Internship = require('../models/Internship');
const asyncHandler = require('express-async-handler');

// @desc    Get all internship roles
// @route   GET /api/internships
// @access  Private
const getInternships = asyncHandler(async (req, res) => {
  const internships = await Internship.find().sort({ createdAt: -1 });
  res.json({ success: true, internships });
});

// @desc    Create an internship role
// @route   POST /api/internships
// @access  Private/Admin
const createInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.create(req.body);
  res.status(201).json({ success: true, internship });
});

// @desc    Update an internship role
// @route   PUT /api/internships/:id
// @access  Private/Admin
const updateInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }
  res.json({ success: true, internship });
});

// @desc    Delete an internship role
// @route   DELETE /api/internships/:id
// @access  Private/Admin
const deleteInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }
  await internship.deleteOne();
  res.json({ success: true, message: 'Internship role removed' });
});

// @desc    Update only the schedule of an internship role
// @route   PUT /api/internships/:id/schedule
// @access  Private/Mentor or Admin
const updateInternshipSchedule = asyncHandler(async (req, res) => {
  const { schedule } = req.body;

  if (!Array.isArray(schedule)) {
    res.status(400);
    throw new Error('schedule must be an array');
  }

  const internship = await Internship.findById(req.params.id);
  if (!internship) {
    res.status(404);
    throw new Error('Internship not found');
  }

  internship.schedule = schedule;
  const updated = await internship.save();

  res.json({ success: true, internship: updated });
});

module.exports = {
  getInternships,
  createInternship,
  updateInternship,
  deleteInternship,
  updateInternshipSchedule,
};
