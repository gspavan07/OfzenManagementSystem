const asyncHandler = require('express-async-handler');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const Project = require('../models/Project');
const Intern = require('../models/Intern');
const Certificate = require('../models/Certificate');
const path = require('path');
const { generateCertificatePdf } = require('../templates/certificate/certificateTemplate');

const PDF_DIR = path.join(__dirname, '../../uploads/pdfs');

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────

// GET /api/submissions/:internId
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ internId: req.params.internId })
    .populate('feedbackGivenBy', 'name')
    .sort({ week: 1 });
  res.json({ success: true, submissions });
});

// POST /api/submissions
const createSubmission = asyncHandler(async (req, res) => {
  const { internId, week, githubLink, figmaLink, description } = req.body;
  if (!internId || !week) { res.status(400); throw new Error('internId and week are required'); }

  const submission = await Submission.create({ internId, week, githubLink, figmaLink, description });
  res.status(201).json({ success: true, submission });
});

// PUT /api/submissions/:id/feedback — Mentor gives feedback
const giveFeedback = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) { res.status(404); throw new Error('Submission not found'); }

  const { mentorFeedback, status } = req.body;
  submission.mentorFeedback = mentorFeedback;
  submission.feedbackGivenBy = req.user.id;
  submission.feedbackGivenAt = new Date();
  if (status) submission.status = status;

  await submission.save();
  res.json({ success: true, submission });
});

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

// GET /api/attendance/:batchId/:sessionDate
const getAttendance = asyncHandler(async (req, res) => {
  const { batchId, sessionDate } = req.params;
  const date = new Date(sessionDate);
  const dayStart = new Date(date.setHours(0, 0, 0, 0));
  const dayEnd = new Date(date.setHours(23, 59, 59, 999));

  const records = await Attendance.find({
    batchId,
    sessionDate: { $gte: dayStart, $lte: dayEnd },
  }).populate('internId');

  res.json({ success: true, records });
});

// POST /api/attendance/mark — Bulk mark attendance
const markAttendance = asyncHandler(async (req, res) => {
  const { batchId, sessionDate, week, attendanceList } = req.body;
  // attendanceList: [{ internId, present: true/false }]

  if (!batchId || !sessionDate || !week || !Array.isArray(attendanceList)) {
    res.status(400);
    throw new Error('batchId, sessionDate, week, and attendanceList are required');
  }

  const date = new Date(sessionDate);
  const results = await Promise.all(
    attendanceList.map(({ internId, present }) =>
      Attendance.findOneAndUpdate(
        { internId, batchId, sessionDate: { $gte: new Date(date.setHours(0,0,0,0)), $lte: new Date(date.setHours(23,59,59,999)) } },
        { internId, batchId, sessionDate: new Date(sessionDate), week, present, markedBy: req.user.id },
        { upsert: true, new: true }
      )
    )
  );

  res.json({ success: true, records: results });
});

// ─── PROJECTS & MILESTONES ────────────────────────────────────────────────────

// GET /api/projects/:internId
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ internId: req.params.internId });
  res.json({ success: true, project: project || null });
});

// PUT /api/projects/:internId/milestone/:week — Complete a milestone
const completeMilestone = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ internId: req.params.internId });
  if (!project) { res.status(404); throw new Error('Project not found'); }

  const milestone = project.milestones.find((m) => m.week === Number(req.params.week));
  if (!milestone) { res.status(404); throw new Error('Milestone not found'); }

  milestone.completed = true;
  milestone.completedOn = new Date();
  await project.save();

  res.json({ success: true, project });
});

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────

// GET /api/certificates/:internId
const getCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ internId: req.params.internId });
  res.json({ success: true, certificate: cert || null });
});

// POST /api/certificates/generate
const generateCertificate = asyncHandler(async (req, res) => {
  const { internId } = req.body;

  const intern = await Intern.findById(internId)
    .populate('userId', 'name email')
    .populate('batchId')
    .populate('internshipId');

  if (!intern) { res.status(404); throw new Error('Intern not found'); }
  if (intern.completionStatus !== 'completed') {
    res.status(400);
    throw new Error('Intern has not completed the program');
  }

  const existing = await Certificate.findOne({ internId });
  if (existing) return res.json({ success: true, certificate: existing });

  const certificate = await Certificate.create({
    internId,
    batchId: intern.batchId._id,
    issueDate: new Date(),
  });

  // Generate PDF
  try {
    const pdfPath = await generateCertificatePdf({
      intern,
      user: intern.userId,
      batch: intern.batchId,
      internship: intern.internshipId,
      certificate,
      outputDir: PDF_DIR,
    });
    certificate.pdfUrl = pdfPath.replace(path.join(__dirname, '../..'), '');
    await certificate.save();
  } catch (pdfErr) {
    console.error('Certificate PDF generation failed:', pdfErr.message);
  }

  res.status(201).json({ success: true, certificate });
});

// GET /api/certificates/verify/:certificateId — Public, no auth
const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateId: req.params.certificateId })
    .populate({ path: 'internId', populate: { path: 'userId', select: 'name' } })
    .populate({
      path: 'batchId',
      select: 'batchName',
      populate: { path: 'internshipId', select: 'domain' }
    });

  if (!cert) {
    return res.json({ success: true, valid: false, message: 'Certificate not found' });
  }

  res.json({
    success: true,
    valid: true,
    data: {
      certificateId: cert.certificateId,
      internName: cert.internId?.userId?.name,
      batch: cert.batchId?.batchName,
      domain: cert.batchId?.internshipId?.domain || 'Unknown',
      issueDate: cert.issueDate,
    },
  });
});

module.exports = {
  getSubmissions, createSubmission, giveFeedback,
  getAttendance, markAttendance,
  getProject, completeMilestone,
  getCertificate, generateCertificate, verifyCertificate,
};
