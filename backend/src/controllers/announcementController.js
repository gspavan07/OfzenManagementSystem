const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');
const Intern = require('../models/Intern');

// GET /api/announcements
const getAnnouncements = asyncHandler(async (req, res) => {
  const filter = { $or: [{ audience: 'all' }] };
  const isAdmin = req.user.permissions?.profileManagement?.view; // Admins see everything

  if (!isAdmin) {
    // 1. Check if user is an intern
    const intern = await Intern.findOne({ userId: req.user.id });
    if (intern) {
      filter.$or.push({ audience: 'interns' });
      if (intern.batchId) {
        filter.$or.push({ audience: 'specific_batch', targetBatchId: intern.batchId });
      }
    } else {
      // 2. Otherwise treat as employee
      filter.$or.push({ audience: 'employees' });
    }
  } else {
    // Admin sees everything, so remove filter
    delete filter.$or;
  }

  const announcements = await Announcement.find(filter)
    .populate('createdBy', 'name')
    .sort({ isPinned: -1, createdAt: -1 });
  res.json({ success: true, announcements });
});

// POST /api/announcements
const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, content, isPinned, audience, targetBatchId } = req.body;
  if (!title || !content) { res.status(400); throw new Error('title and content are required'); }

  const announcement = await Announcement.create({ 
    title, 
    content, 
    isPinned, 
    audience, 
    targetBatchId, 
    createdBy: req.user.id 
  });
  res.status(201).json({ success: true, announcement });
});

// PUT /api/announcements/:id
const updateAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (!a) { res.status(404); throw new Error('Announcement not found'); }

  const { title, content, isPinned } = req.body;
  if (title) a.title = title;
  if (content) a.content = content;
  if (isPinned !== undefined) a.isPinned = isPinned;
  a.updatedBy = req.user.id;

  await a.save();
  res.json({ success: true, announcement: a });
});

// DELETE /api/announcements/:id
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const a = await Announcement.findById(req.params.id);
  if (!a) { res.status(404); throw new Error('Announcement not found'); }
  await a.deleteOne();
  res.json({ success: true, message: 'Announcement deleted' });
});

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
