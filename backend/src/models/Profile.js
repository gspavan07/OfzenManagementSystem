const mongoose = require('mongoose');

// ─── Full Permissions Map ──────────────────────────────────────────────────────
const permissionsSchema = new mongoose.Schema({
  // Finance & Revenue
  revenue: {
    view: { type: Boolean, default: false },
    export: { type: Boolean, default: false },
  },
  gstTracker: {
    view: { type: Boolean, default: false },
  },
  expenseTracker: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },

  // Employee Management
  employees: {
    view: { type: Boolean, default: false },
    viewDetails: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },

  // Payroll & Salary
  payroll: {
    view: { type: Boolean, default: false },
    generate: { type: Boolean, default: false },
    viewDeductions: { type: Boolean, default: false },
    markPaid: { type: Boolean, default: false },
    downloadOwn: { type: Boolean, default: false },
  },

  // Tax Management
  taxManagement: {
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
  },

  // Intern Batch Management
  internBatches: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    assignMentor: { type: Boolean, default: false },
  },

  // Intern Registrations
  internRegistrations: {
    view: { type: Boolean, default: false },
    approve: { type: Boolean, default: false },
    reject: { type: Boolean, default: false },
  },

  // Intern Self Dashboard
  internSelf: {
    viewProfile: { type: Boolean, default: false },
    viewSchedule: { type: Boolean, default: false },
    viewMilestones: { type: Boolean, default: false },
    submitWork: { type: Boolean, default: false },
    viewFeedback: { type: Boolean, default: false },
    downloadCertificate: { type: Boolean, default: false },
    viewOfferLetter: { type: Boolean, default: false },
  },

  // Mentor Tools
  mentorTools: {
    viewAssignedBatches: { type: Boolean, default: false },
    viewInternProfiles: { type: Boolean, default: false },
    markAttendance: { type: Boolean, default: false },
    giveFeedback: { type: Boolean, default: false },
    flagAtRisk: { type: Boolean, default: false },
    completeMilestone: { type: Boolean, default: false },
  },

  // Announcements
  announcements: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
  },

  // Mail & Document Generation
  mailSystem: {
    sendOfferLetter: { type: Boolean, default: false },
    sendCertificate: { type: Boolean, default: false },
    sendPayslip: { type: Boolean, default: false },
    sendCustomMail: { type: Boolean, default: false },
    configureSmtp: { type: Boolean, default: false },
  },

  // Profile & Permission Management
  profileManagement: {
    view: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    delete: { type: Boolean, default: false },
    assignToUser: { type: Boolean, default: false },
  },
}, { _id: false });

// ─── Profile Schema ────────────────────────────────────────────────────────────
const profileSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, 'Profile label is required'],
      trim: true,
      unique: true,
    },
    isDefault: {
      type: Boolean,
      default: false, // default profiles cannot be deleted
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
