const InternshipProject = require('../models/InternshipProject');
const asyncHandler = require('express-async-handler');

// @desc    Get all project templates for an internship
// @route   GET /api/internship-projects
// @access  Private
const getProjectsByInternship = asyncHandler(async (req, res) => {
  const { internshipId } = req.query;
  const filter = {};
  if (internshipId) filter.internshipId = internshipId;

  const projects = await InternshipProject.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, projects });
});

// @desc    Create a project template
// @route   POST /api/internship-projects
// @access  Private/Admin
const createProjectTemplate = asyncHandler(async (req, res) => {
  const project = await InternshipProject.create(req.body);
  res.status(201).json({ success: true, project });
});

// @desc    Update a project template
// @route   PUT /api/internship-projects/:id
// @access  Private/Admin
const updateProjectTemplate = asyncHandler(async (req, res) => {
  const project = await InternshipProject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!project) {
    res.status(404);
    throw new Error('Project template not found');
  }
  res.json({ success: true, project });
});

// @desc    Delete a project template
// @route   DELETE /api/internship-projects/:id
// @access  Private/Admin
const deleteProjectTemplate = asyncHandler(async (req, res) => {
  const project = await InternshipProject.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project template not found');
  }
  await project.deleteOne();
  res.json({ success: true, message: 'Project template removed' });
});

module.exports = {
  getProjectsByInternship,
  createProjectTemplate,
  updateProjectTemplate,
  deleteProjectTemplate,
};
