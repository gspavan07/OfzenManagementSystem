const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // ── Salary Components ────────────────────────────────────
    salary: {
      basic: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      travelAllowance: { type: Number, default: 0 },
      medicalAllowance: { type: Number, default: 0 },
      otherAllowance: { type: Number, default: 0 },
      grossSalary: { type: Number, default: 0 }, // auto-calculated on save
    },

    // ── Deduction Flags ──────────────────────────────────────
    deductions: {
      tdsApplicable: { type: Boolean, default: false },
      tdsPercent: { type: Number, default: 0 },
      pfApplicable: { type: Boolean, default: false },
      esiApplicable: { type: Boolean, default: false },
      ptApplicable: { type: Boolean, default: false },
      lwfApplicable: { type: Boolean, default: false },
    },

    // ── Bank Details ─────────────────────────────────────────
    bankAccount: {
      accountNumber: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      bankName: { type: String, trim: true },
      accountHolderName: { type: String, trim: true },
    },

    // ── Identity ─────────────────────────────────────────────
    panNumber: { type: String, trim: true, uppercase: true },
    aadharNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    joinDate: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Auto-calculate grossSalary before saving ──────────────────────────────────
employeeSchema.pre('save', function (next) {
  const s = this.salary;
  this.salary.grossSalary =
    (s.basic || 0) +
    (s.hra || 0) +
    (s.travelAllowance || 0) +
    (s.medicalAllowance || 0) +
    (s.otherAllowance || 0);
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
