const mongoose = require('mongoose');


const internBatchSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true, trim: true },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    mentorDay: { type: String, trim: true }, // e.g., "Friday", "Monday"
    stipend: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternBatch', internBatchSchema);
