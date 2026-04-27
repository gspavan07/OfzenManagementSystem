const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    isPinned: { type: Boolean, default: false },
    audience: {
      type: String,
      enum: ['all', 'employees', 'interns', 'specific_batch'],
      default: 'all',
    },
    targetBatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InternBatch',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Announcement', announcementSchema);
