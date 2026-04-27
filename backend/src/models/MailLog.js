const mongoose = require('mongoose');

const mailLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['offer_letter', 'certificate', 'payslip', 'custom'],
      required: true,
    },
    toEmail: { type: String, required: true },
    toName: { type: String },
    subject: { type: String, required: true },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sentVia: {
      type: String,
      enum: ['smtp', 'manual'],
      default: 'smtp',
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'manual_pending'],
      default: 'sent',
    },
    sentAt: { type: Date, default: Date.now },
    attachmentUrl: { type: String },
    errorMessage: { type: String }, // store error if failed
  },
  { timestamps: true }
);

module.exports = mongoose.model('MailLog', mailLogSchema);
