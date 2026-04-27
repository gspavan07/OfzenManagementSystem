const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },

    earnings: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      travelAllowance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      otherAllowance: { type: Number, default: 0 },
      grossEarnings: { type: Number, default: 0 },
    },

    deductions: {
      tds: { type: Number, default: 0 },
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
      pt: { type: Number, default: 0 },
      lwf: { type: Number, default: 0 },
      loanRecovery: { type: Number, default: 0 },
      otherDeductions: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },

    // Employer-side (for reference display)
    employerContributions: {
      pf: { type: Number, default: 0 },
      esi: { type: Number, default: 0 },
    },

    netPay: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    presentDays: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['draft', 'generated', 'paid'],
      default: 'draft',
    },
    paidOn: { type: Date },
    pdfUrl: { type: String },
    generatedAt: { type: Date },
  },
  { timestamps: true }
);

// Unique constraint: one payslip per employee per month/year
payslipSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payslip', payslipSchema);
