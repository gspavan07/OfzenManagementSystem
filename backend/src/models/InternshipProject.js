const mongoose = require('mongoose');

const internshipProjectSchema = new mongoose.Schema(
  {
    internshipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    requirements: { type: String, trim: true }, // Detailed professional requirements
    deliverables: { type: String, trim: true }, // What the intern should submit
    techStack: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InternshipProject', internshipProjectSchema);
