const mongoose = require("mongoose");

const daySchema = new mongoose.Schema(
  {
    day: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);

const scheduleItemSchema = new mongoose.Schema(
  {
    week: { type: Number, required: true },
    topic: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    days: [daySchema],
  },
  { _id: false },
);

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g., FSD - Intern
    domain: {
      type: String,
      required: true,
      enum: [
        "Full Stack",
        "Frontend",
        "UI/UX",
        "Generative AI",
        "Python",
        "Data Analytics",
        "Cloud Computing",
      ],
    },
    description: { type: String, trim: true },
    openings: { type: Number, default: 0 }, // Indicative openings for display
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    fee: { type: Number, required: true, default: 899 }, // Global fee for this internship role
    durationWeeks: { type: Number, required: true }, // e.g., 8
    certificate: { type: String, required: true, trim: true }, // e.g., Completion Certificate, LOR
    techStack: { type: [String], required: true, default: [] }, // e.g., ['React', 'Node.js']
    projectStartWeek: { type: Number, required: true, default: 5 }, // Project phase starts from this week
    schedule: [scheduleItemSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Internship", internshipSchema);
