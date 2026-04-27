const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
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
    sessionDate: { type: Date, required: true },
    week: { type: Number, required: true },
    present: { type: Boolean, default: false },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// One attendance record per intern per session date
attendanceSchema.index({ internId: 1, sessionDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
