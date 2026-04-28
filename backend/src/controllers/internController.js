const asyncHandler = require("express-async-handler");
const InternBatch = require("../models/InternBatch");
const Intern = require("../models/Intern");
const User = require("../models/User");
const path = require("path");
const {
  generateOfferLetterPdf,
} = require("../templates/offerLetter/offerLetterTemplate");
const { sendApprovalEmails } = require("../utils/careerMailer");

// ─── BATCHES ──────────────────────────────────────────────────────────────────

// GET /api/intern-batches
const getBatches = asyncHandler(async (req, res) => {
  const { status, mentorId } = req.query;
  const filter = {};
  if (status) filter.status = status;
  // Mentors see only their assigned batches
  if (
    req.user.permissions?.mentorTools?.viewAssignedBatches &&
    !req.user.permissions?.internBatches?.view
  ) {
    filter.mentorId = req.user.id;
  } else if (mentorId) {
    filter.mentorId = mentorId;
  }

  const batches = await InternBatch.find(filter)
    .populate("mentorId", "name email")
    .populate("internshipId", "title domain")
    .sort({ startDate: -1 });

  // Attach intern count to each batch
  const batchesWithCount = await Promise.all(
    batches.map(async (b) => {
      const count = await Intern.countDocuments({
        batchId: b._id,
        registrationStatus: "approved",
      });
      return { ...b.toObject(), internCount: count };
    }),
  );

  res.json({ success: true, batches: batchesWithCount });
});

// GET /api/intern-batches/:id
const getBatchById = asyncHandler(async (req, res) => {
  const batch = await InternBatch.findById(req.params.id).populate(
    "mentorId",
    "name email",
  );
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const interns = await Intern.find({ batchId: batch._id })
    .populate("userId", "name email phone")
    .populate("internshipId", "title");

  // Attach project assignment status
  const Project = require("../models/Project");
  const internsWithProjectStatus = await Promise.all(
    interns.map(async (i) => {
      const project = await Project.findOne({ internId: i._id });
      return { ...i.toObject(), projectAssigned: !!project };
    }),
  );

  res.json({ success: true, batch, interns: internsWithProjectStatus });
});

// POST /api/intern-batches
const createBatch = asyncHandler(async (req, res) => {
  const {
    batchName,
    internshipId,
    startDate,
    endDate,
    mentorId,
    mentorDay,
    stipend,
    status,
  } = req.body;

  if (!batchName || !internshipId || !startDate || !endDate) {
    res.status(400);
    throw new Error(
      "batchName, internshipId, startDate, and endDate are required",
    );
  }

  const batch = await InternBatch.create({
    batchName,
    internshipId,
    startDate,
    endDate,
    mentorId,
    mentorDay,
    stipend,
    status,
  });
  res.status(201).json({ success: true, batch });
});

// PUT /api/intern-batches/:id
const updateBatch = asyncHandler(async (req, res) => {
  const batch = await InternBatch.findById(req.params.id);
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const fields = [
    "batchName",
    "startDate",
    "endDate",
    "mentorId",
    "mentorDay",
    "stipend",
    "status",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) batch[f] = req.body[f];
  });

  const updated = await batch.save();
  res.json({ success: true, batch: updated });
});

// ─── INTERNS ──────────────────────────────────────────────────────────────────

// GET /api/interns
const getInterns = asyncHandler(async (req, res) => {
  const { batchId, registrationStatus, completionStatus } = req.query;
  const filter = {};
  if (batchId) filter.batchId = batchId;
  if (registrationStatus) filter.registrationStatus = registrationStatus;
  if (completionStatus) filter.completionStatus = completionStatus;

  const interns = await Intern.find(filter)
    .populate("userId", "name email phone")
    .populate({
      path: "batchId",
      select: "batchName",
    })
    .populate({
      path: "internshipId",
      select: "title domain",
    });

  res.json({ success: true, interns });
});

// GET /api/interns/:id
const getInternById = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.id)
    .populate("userId", "name email phone")
    .populate(
      "batchId",
      "batchName startDate endDate mentorId mentorDay stipend status",
    )
    .populate(
      "internshipId",
      "title domain techStack durationWeeks fee schedule",
    );

  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }

  // Fetch assigned project
  const Project = require("../models/Project");
  const project = await Project.findOne({ internId: intern._id });

  // Clean up paths to ensure they are full URLs
  const internObj = intern.toObject();
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  if (internObj.offerLetterUrl && typeof internObj.offerLetterUrl === 'string') {
    if (internObj.offerLetterUrl.startsWith('/uploads/')) {
       internObj.offerLetterUrl = `${baseUrl}${internObj.offerLetterUrl}`;
    } else if (!internObj.offerLetterUrl.startsWith('http')) {
       // Handle case where it might just be the filename or an old absolute path
       const filename = internObj.offerLetterUrl.split('/').pop();
       internObj.offerLetterUrl = `${baseUrl}/uploads/pdfs/offer_letters/${filename}`;
    }
  }

  res.json({ success: true, intern: { ...internObj, project } });
});

// POST /api/interns
const createIntern = asyncHandler(async (req, res) => {
  const { userId, batchId, college, course, paymentStatus, receiptNumber } =
    req.body;
  if (!userId || !batchId) {
    res.status(400);
    throw new Error("userId and batchId are required");
  }

  const intern = await Intern.create({
    userId,
    batchId,
    college,
    course,
    paymentStatus,
    receiptNumber,
  });
  res.status(201).json({ success: true, intern });
});

// PUT /api/interns/:id/approve
const approveIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.id)
    .populate("userId", "name email")
    .populate({
      path: "batchId",
      populate: { path: "internshipId" },
    });

  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }

  // 1. Update Status
  intern.registrationStatus = "approved";

  // 2. Generate Offer Letter
  try {
    const outputDir = path.join(__dirname, "../../uploads/pdfs/offer_letters");
    const { absolutePath, fullUrl } = await generateOfferLetterPdf({
      intern,
      outputDir,
    });

    intern.offerLetterUrl = fullUrl;
    intern.offerLetterSent = true;

    // 3. Send Approval Emails
    await sendApprovalEmails({
      name: intern.userId.name,
      email: intern.userId.email,
      offerLetterPath: absolutePath,
      batchName: intern.batchId.batchName,
      domain: intern.internshipId.domain,
    });
  } catch (error) {
    console.error("Error in approval pipeline:", error);
    // We still save the status update even if email fails, but log the error
  }

  await intern.save();
  res.json({ success: true, intern });
});

// PUT /api/interns/:id/reject
const rejectIntern = asyncHandler(async (req, res) => {
  const intern = await Intern.findById(req.params.id);
  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }
  intern.registrationStatus = "rejected";
  await intern.save();
  res.json({ success: true, intern });
});

// GET /api/interns/me
const getInternMe = asyncHandler(async (req, res) => {
  const intern = await Intern.findOne({ userId: req.user.id })
    .populate("userId", "name email phone")
    .populate("internshipId")
    .populate({
      path: "batchId",
      populate: { path: "mentorId", select: "name email" },
    });

  if (!intern) {
    return res.json({ success: true, intern: null });
  }

  // Fetch assigned project
  const Project = require("../models/Project");
  const project = await Project.findOne({ internId: intern._id });

  res.json({ success: true, intern: { ...intern.toObject(), project } });
});

// PUT /api/intern-batches/:id/onboard
const onboardBatch = asyncHandler(async (req, res) => {
  const { startDate, endDate, mentorId, stipend } = req.body;
  const batch = await InternBatch.findById(req.params.id);

  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  // 1. Update Batch Info
  batch.startDate = startDate || batch.startDate;
  batch.endDate = endDate || batch.endDate;
  batch.mentorId = mentorId || batch.mentorId;
  batch.stipend = stipend || batch.stipend;
  batch.status = "active"; // Move to active status
  await batch.save();

  // 2. Find Pending Interns
  const pendingInterns = await Intern.find({
    batchId: batch._id,
    registrationStatus: "pending",
  }).populate("userId", "name email");

  const results = {
    total: pendingInterns.length,
    success: 0,
    failed: 0,
    errors: [],
  };

  // 3. Process each intern (similar to approveIntern)
  for (const intern of pendingInterns) {
    try {
      // Refresh populate for template
      const fullIntern = await Intern.findById(intern._id)
        .populate("userId", "name email")
        .populate({
          path: "batchId",
          populate: { path: "internshipId", select: "title domain" },
        });

      // Update Status
      fullIntern.registrationStatus = "approved";

      const outputDir = path.join(
        __dirname,
        "../../uploads/pdfs/offer_letters",
      );
      const { absolutePath, fullUrl } = await generateOfferLetterPdf({
        intern: fullIntern,
        user: fullIntern.userId,
        batch: fullIntern.batchId,
        internship: fullIntern.internshipId,
        outputDir,
      });

      fullIntern.offerLetterUrl = fullUrl;
      fullIntern.offerLetterSent = true;

      await sendApprovalEmails({
        name: fullIntern.userId.name,
        email: fullIntern.userId.email,
        offerLetterPath: absolutePath,
        role: fullIntern.batchId.internshipId.title,
        domain: fullIntern.batchId.internshipId.domain,
      });

      await fullIntern.save();
      results.success++;
    } catch (err) {
      console.error(`Failed to onboard intern ${intern._id}:`, err);
      results.failed++;
      results.errors.push({ id: intern._id, error: err.message });
    }
  }

  res.json({ success: true, results, batch });
});

// PUT /api/interns/:id/mark-week
const markWeekCompleted = asyncHandler(async (req, res) => {
  const { weekNumber, completed } = req.body;
  const intern = await Intern.findById(req.params.id);

  if (!intern) {
    res.status(404);
    throw new Error("Intern not found");
  }

  if (completed) {
    if (!intern.completedWeeks.includes(weekNumber)) {
      intern.completedWeeks.push(weekNumber);
    }
  } else {
    intern.completedWeeks = intern.completedWeeks.filter(
      (w) => w !== weekNumber,
    );
  }

  await intern.save();
  res.json({ success: true, completedWeeks: intern.completedWeeks });
});

// PUT /api/intern-batches/:id/bulk-mark-week
const bulkMarkWeekCompleted = asyncHandler(async (req, res) => {
  const { weekNumber, completed } = req.body;
  const interns = await Intern.find({
    batchId: req.params.id,
    registrationStatus: "approved",
  });

  await Promise.all(
    interns.map(async (intern) => {
      if (completed) {
        if (!intern.completedWeeks.includes(weekNumber)) {
          intern.completedWeeks.push(weekNumber);
          await intern.save();
        }
      } else {
        if (intern.completedWeeks.includes(weekNumber)) {
          intern.completedWeeks = intern.completedWeeks.filter(
            (w) => w !== weekNumber,
          );
          await intern.save();
        }
      }
    }),
  );

  res.json({
    success: true,
    message: `Week ${weekNumber} updated for ${interns.length} interns.`,
  });
});

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  getInterns,
  getInternById,
  createIntern,
  approveIntern,
  rejectIntern,
  getInternMe,
  onboardBatch,
  markWeekCompleted,
  bulkMarkWeekCompleted,
};
