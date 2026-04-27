const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    internId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Intern',
      required: true,
    },
    week: { type: Number, required: true },
    githubLink: { type: String, trim: true },
    figmaLink: { type: String, trim: true },
    description: { type: String, trim: true },
    submittedAt: { type: Date, default: Date.now },
    mentorFeedback: { type: String, trim: true },
    feedbackGivenAt: { type: Date },
    feedbackGivenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'revision_requested'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

// One submission per intern per week
submissionSchema.index({ internId: 1, week: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
