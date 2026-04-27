const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    completedOn: { type: Date },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
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
    projectTitle: { type: String, required: true, trim: true },
    brief: { type: String, trim: true },
    milestones: [milestoneSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);
