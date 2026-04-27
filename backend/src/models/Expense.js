const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, default: Date.now },
    category: {
      type: String,
      required: true,
      enum: ['Salary', 'Software', 'Marketing', 'Office', 'Other'],
    },
    amount: { type: Number, required: true },
    description: { type: String, trim: true },
    paidTo: { type: String, trim: true },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Expense', expenseSchema);
