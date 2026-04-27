const mongoose = require('mongoose');

const internSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternBatch',
    },
    college: { type: String, trim: true },
    course: { type: String, trim: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    receiptNumber: { type: String, trim: true },
    offerLetterSent: { type: Boolean, default: false },
    offerLetterUrl: { type: String },
    registrationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    completionStatus: {
      type: String,
      enum: ['ongoing', 'completed', 'dropped'],
      default: 'ongoing',
    },
    isAtRisk: { type: Boolean, default: false },
    atRiskNote: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Intern', internSchema);
