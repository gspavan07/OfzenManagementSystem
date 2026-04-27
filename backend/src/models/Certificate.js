const mongoose = require('mongoose');
const { CERT_ID_PREFIX } = require('../config/constants');

const certificateSchema = new mongoose.Schema(
  {
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Intern',
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternBatch',
      required: true,
    },
    issueDate: { type: Date, default: Date.now },
    // Unique ID: OFZ-YYYY-XXXX
    certificateId: {
      type: String,
      unique: true,
      required: true,
    },
    pdfUrl: { type: String },
    sentByMail: { type: Boolean, default: false },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

// ─── Generate certificate ID before save ───────────────────────────────────────
certificateSchema.pre('validate', async function (next) {
  if (this.isNew && !this.certificateId) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Certificate').countDocuments();
    const seq = String(count + 1).padStart(4, '0');
    this.certificateId = `${CERT_ID_PREFIX}-${year}-${seq}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
