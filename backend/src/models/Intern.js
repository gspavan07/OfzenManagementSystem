const mongoose = require("mongoose");

const internSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship",
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InternBatch",
    },
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    // After the 'course' field, add:
    passOutYear: { type: Number },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    receiptNumber: { type: String, trim: true },
    offerLetterSent: { type: Boolean, default: false },
    offerLetterUrl: { type: String },
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    completionStatus: {
      type: String,
      enum: ["ongoing", "completed", "dropped"],
      default: "ongoing",
    },
    isAtRisk: { type: Boolean, default: false },
    atRiskNote: { type: String, trim: true },
    completedWeeks: { type: [Number], default: [] }, // Tracking progress by week numbers
  },
  { timestamps: true },
);

module.exports = mongoose.model("Intern", internSchema);
