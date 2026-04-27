const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    sessionDate: { type: Date },
    description: { type: String, trim: true },
  },
  { _id: false }
);

const internBatchSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true, trim: true },
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    domain: {
      type: String,
      required: true,
      enum: ['Full Stack', 'Frontend', 'UI/UX', 'AI + Full Stack'],
    },
    stack: { type: String, trim: true },
    durationWeeks: { type: Number, required: true, default: 8 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fee: { type: Number, default: 899 },
    stipend: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'completed'],
      default: 'upcoming',
    },
    schedule: [scheduleItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternBatch', internBatchSchema);
