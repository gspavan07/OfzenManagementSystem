const asyncHandler = require("express-async-handler");
const Submission = require("../models/Submission");
const Attendance = require("../models/Attendance");
const Project = require("../models/Project");
const Intern = require("../models/Intern");
const Certificate = require("../models/Certificate");
const path = require("path");
const {
  generateCertificatePdf,
  generateCertificateHtml,
} = require("../templates/certificate/certificateTemplate");

const PDF_DIR = path.join(__dirname, "../../uploads/pdfs");

// ─── SUBMISSIONS ──────────────────────────────────────────────────────────────

// GET /api/submissions/:internId
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ internId: req.params.internId })
    .populate("feedbackGivenBy", "name")
    .sort({ week: 1 });
  res.json({ success: true, submissions });
});

// POST /api/submissions
const createSubmission = asyncHandler(async (req, res) => {
  const { internId, week, githubLink, figmaLink, description } = req.body;
  if (!internId || !week) {
    res.status(400);
    throw new Error("internId and week are required");
  }

  const submission = await Submission.create({
    internId,
    week,
    githubLink,
    figmaLink,
    description,
  });
  res.status(201).json({ success: true, submission });
});

// PUT /api/submissions/:id/feedback — Mentor gives feedback
const giveFeedback = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);
  if (!submission) {
    res.status(404);
    throw new Error("Submission not found");
  }

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
  }).populate("internId");

  res.json({ success: true, records });
});

// POST /api/attendance/mark — Bulk mark attendance
const markAttendance = asyncHandler(async (req, res) => {
  const { batchId, sessionDate, week, attendanceList } = req.body;
  // attendanceList: [{ internId, present: true/false }]

  if (!batchId || !sessionDate || !week || !Array.isArray(attendanceList)) {
    res.status(400);
    throw new Error(
      "batchId, sessionDate, week, and attendanceList are required",
    );
  }

  const date = new Date(sessionDate);
  const results = await Promise.all(
    attendanceList.map(({ internId, present }) =>
      Attendance.findOneAndUpdate(
        {
          internId,
          batchId,
          sessionDate: {
            $gte: new Date(date.setHours(0, 0, 0, 0)),
            $lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        },
        {
          internId,
          batchId,
          sessionDate: new Date(sessionDate),
          week,
          present,
          markedBy: req.user.id,
        },
        { upsert: true, new: true },
      ),
    ),
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
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }

  const milestone = project.milestones.find(
    (m) => m.week === Number(req.params.week),
  );
  if (!milestone) {
    res.status(404);
    throw new Error("Milestone not found");
  }

  milestone.completed = true;
  milestone.completedOn = new Date();
  await project.save();

  res.json({ success: true, project });
});

// ─── CERTIFICATES ─────────────────────────────────────────────────────────────

// GET /api/certificates/:internId
const getCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ internId: req.params.internId });

  if (!cert) return res.json({ success: true, certificate: null });

  // Sanitize path
  const obj = cert.toObject();
  const baseUrl = process.env.API_BASE_URL || "http://localhost:5001";
  if (
    obj.pdfUrl &&
    typeof obj.pdfUrl === "string" &&
    !obj.pdfUrl.startsWith("http")
  ) {
    obj.pdfUrl = `${baseUrl}${obj.pdfUrl.startsWith("/") ? "" : "/"}${obj.pdfUrl}`;
  }

  res.json({ success: true, certificate: obj });
});

// POST /api/certificates/generate
const generateCertificate = asyncHandler(async (req, res) => {
  const { internId } = req.body;

  const intern = await Intern.findById(internId)
    .populate("userId", "name email")
    .populate("batchId")
    .populate("internshipId");

  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }
  if (intern.completionStatus !== "completed") {
    res.status(400);
    throw new Error("Intern has not completed the program");
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
    const { fullUrl } = await generateCertificatePdf({
      intern,
      user: intern.userId,
      batch: intern.batchId,
      internship: intern.internshipId,
      certificate,
      outputDir: PDF_DIR,
    });
    certificate.pdfUrl = fullUrl;
    await certificate.save();
  } catch (pdfErr) {
    console.error("Certificate PDF generation failed:", pdfErr.message);
  }

  res.status(201).json({ success: true, certificate });
});

// POST /api/certificates/send/:internId
const sendCertificateEmail = asyncHandler(async (req, res) => {
  const { internId } = req.params;
  const intern = await Intern.findById(internId).populate(
    "userId",
    "name email",
  );
  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }

  const cert = await Certificate.findOne({ internId });
  if (!cert || !cert.pdfUrl) {
    res.status(400);
    throw new Error("Certificate not generated yet");
  }

  // Use mailer utility
  const { sendMail } = require("../utils/mailer");
  const path = require("path");

  // Resolve absolute path for attachment
  // Assuming pdfUrl is like /uploads/pdfs/xxx.pdf
  const pdfPath = path.join(__dirname, "../../", cert.pdfUrl);

  const mailResult = await sendMail({
    sentByUserId: req.user.id,
    toEmail: intern.userId.email,
    toName: intern.userId.name,
    subject: `Internship Completion Certificate — ${intern.userId.name}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">Congratulations, ${intern.userId.name}!</h2>
        <p>We are pleased to inform you that you have successfully completed your internship program at <b>Ofzen Technologies</b>.</p>
        <p>Your official Internship Completion Certificate is attached to this email.</p>
        <br/>
        <p>We wish you all the best for your future endeavors!</p>
        <hr/>
        <p style="font-size: 12px; color: #666;">This is an automated email from the Ofzen Management System.</p>
      </div>
    `,
    type: "certificate",
    attachmentPath: pdfPath,
  });

  if (mailResult.success) {
    cert.sentByMail = true;
    cert.sentAt = new Date();
    await cert.save();
    res.json({ success: true, message: "Certificate sent successfully" });
  } else {
    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: mailResult.error,
      via: mailResult.via,
    });
  }
});

// GET /api/interns/certificates/:internId/preview — Mentor preview
const previewCertificate = asyncHandler(async (req, res) => {
  const { internId } = req.params;

  const intern = await Intern.findById(internId)
    .populate("userId", "name email")
    .populate("batchId")
    .populate("internshipId");

  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }

  // Security: Only assigned mentor or admin
  const isMentor =
    intern.batchId?.mentorId?.toString() === req.user.id.toString();
  const isAdmin =
    req.user.role === "admin" || req.user.permissions?.internBatches?.edit;

  if (!isMentor && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to preview this certificate");
  }

  // Generate HTML
  const html = generateCertificateHtml({
    intern,
    certificate: { certificateId: "PREVIEW-ONLY", issueDate: new Date() },
  });

  try {
    const { generatePdfBuffer } = require("../utils/pdfGenerator");
    const buffer = await generatePdfBuffer(html);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="preview_${intern.userId.name.replace(/\s+/g, "_")}.pdf"`,
    );
    res.send(buffer);
  } catch (pdfErr) {
    console.error("Certificate preview generation failed:", pdfErr.message);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate preview" });
  }
});

// GET /api/certificates/verify/:certificateId — Public, no auth
const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({
    certificateId: req.params.certificateId,
  })
    .populate({
      path: "internId",
      populate: { path: "userId", select: "name email" },
    })
    .populate({
      path: "batchId",
      populate: { path: "internshipId" },
    });
  console.log("cert", cert);
  if (!cert) {
    return res.json({
      success: true,
      valid: false,
      message: "Certificate not found",
    });
  }

  res.json({
    success: true,
    valid: true,
    data: {
      certificateId: cert.certificateId,
      internName: cert.internId?.userId?.name,
      role: cert.batchId?.internshipId?.title,
      domain: cert.batchId?.internshipId?.domain || "Unknown",
      startDate: cert.batchId?.startDate,
      endDate: cert.batchId?.endDate,
      issueDate: cert.issueDate,
      offerLetterUrl: cert.internId?.offerLetterUrl,
      certificateUrl: cert.pdfUrl,
    },
  });
});

// POST /api/interns/projects/assign
const assignProject = asyncHandler(async (req, res) => {
  const { internId, batchId, projectTitle, brief, milestones } = req.body;

  if (!internId || !batchId || !projectTitle) {
    res.status(400);
    throw new Error("internId, batchId, and projectTitle are required");
  }

  // Create or Update the project for this intern
  const project = await Project.findOneAndUpdate(
    { internId },
    {
      internId,
      batchId,
      projectTitle,
      brief,
      milestones: milestones || [],
    },
    { upsert: true, new: true },
  );

  res.status(201).json({ success: true, project });
});

module.exports = {
  getSubmissions,
  createSubmission,
  giveFeedback,
  getAttendance,
  markAttendance,
  getProject,
  completeMilestone,
  getCertificate,
  generateCertificate,
  verifyCertificate,
  previewCertificate,
  assignProject,
  sendCertificateEmail,
};
