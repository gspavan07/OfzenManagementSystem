const mongoose = require('mongoose');

const revenueSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    category: {
      type: String,
      required: true,
      enum: ['Internships', 'Projects', 'Services', 'Other'],
      default: 'Internships'
    },
    title: { type: String, trim: true },
    totalCollected: { type: Number, required: true, default: 0 },
    numberOfStudents: { type: Number, default: 0 },
    gstApplicable: { type: Boolean, default: false },
    gstAmount: { type: Number, default: 0 },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const Revenue = mongoose.model('Revenue', revenueSchema);

// Drop the old index that causes duplicate key errors for month/year
Revenue.collection.dropIndex('month_1_year_1').catch(err => {
  // Ignore error if index doesn't exist
  if (err.code !== 27) console.error('Notice: Error dropping old index', err);
});

module.exports = Revenue;
