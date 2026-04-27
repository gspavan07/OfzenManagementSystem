require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Profile = require('../models/Profile');
const User = require('../models/User');

// ─── Default Profile Seed Data ─────────────────────────────────────────────────
const defaultProfiles = [
  {
    label: 'CEO / Admin',
    isDefault: true,
    permissions: {
      revenue: { view: true, export: true },
      gstTracker: { view: true },
      expenseTracker: { view: true, create: true, edit: true, delete: true },
      employees: { view: true, viewDetails: true, create: true, edit: true, delete: true },
      payroll: { view: true, generate: true, viewDeductions: true, markPaid: true, downloadOwn: true },
      taxManagement: { view: true, edit: true },
      internBatches: { view: true, create: true, edit: true, delete: true, assignMentor: true },
      internRegistrations: { view: true, approve: true, reject: true },
      internSelf: { viewProfile: true, viewSchedule: true, viewMilestones: true, submitWork: true, viewFeedback: true, downloadCertificate: true, viewOfferLetter: true },
      mentorTools: { viewAssignedBatches: true, viewInternProfiles: true, markAttendance: true, giveFeedback: true, flagAtRisk: true, completeMilestone: true },
      announcements: { view: true, create: true, edit: true, delete: true },
      mailSystem: { sendOfferLetter: true, sendCertificate: true, sendPayslip: true, sendCustomMail: true, configureSmtp: true },
      profileManagement: { view: true, create: true, edit: true, delete: true, assignToUser: true },
    },
  },
  {
    label: 'HR Manager',
    isDefault: true,
    permissions: {
      revenue: { view: false, export: false },
      gstTracker: { view: false },
      expenseTracker: { view: false, create: false, edit: false, delete: false },
      employees: { view: true, viewDetails: true, create: true, edit: true, delete: false },
      payroll: { view: true, generate: true, viewDeductions: true, markPaid: true, downloadOwn: false },
      taxManagement: { view: true, edit: true },
      internBatches: { view: true, create: true, edit: true, delete: false, assignMentor: true },
      internRegistrations: { view: true, approve: true, reject: true },
      internSelf: { viewProfile: false, viewSchedule: false, viewMilestones: false, submitWork: false, viewFeedback: false, downloadCertificate: false, viewOfferLetter: false },
      mentorTools: { viewAssignedBatches: false, viewInternProfiles: false, markAttendance: false, giveFeedback: false, flagAtRisk: false, completeMilestone: false },
      announcements: { view: true, create: true, edit: true, delete: true },
      mailSystem: { sendOfferLetter: true, sendCertificate: true, sendPayslip: true, sendCustomMail: true, configureSmtp: true },
      profileManagement: { view: false, create: false, edit: false, delete: false, assignToUser: false },
    },
  },
  {
    label: 'Mentor',
    isDefault: true,
    permissions: {
      revenue: { view: false, export: false },
      gstTracker: { view: false },
      expenseTracker: { view: false, create: false, edit: false, delete: false },
      employees: { view: false, viewDetails: false, create: false, edit: false, delete: false },
      payroll: { view: false, generate: false, viewDeductions: false, markPaid: false, downloadOwn: false },
      taxManagement: { view: false, edit: false },
      internBatches: { view: true, create: false, edit: false, delete: false, assignMentor: false },
      internRegistrations: { view: false, approve: false, reject: false },
      internSelf: { viewProfile: false, viewSchedule: false, viewMilestones: false, submitWork: false, viewFeedback: false, downloadCertificate: false, viewOfferLetter: false },
      mentorTools: { viewAssignedBatches: true, viewInternProfiles: true, markAttendance: true, giveFeedback: true, flagAtRisk: true, completeMilestone: true },
      announcements: { view: true, create: false, edit: false, delete: false },
      mailSystem: { sendOfferLetter: false, sendCertificate: false, sendPayslip: false, sendCustomMail: false, configureSmtp: false },
      profileManagement: { view: false, create: false, edit: false, delete: false, assignToUser: false },
    },
  },
  {
    label: 'Employee',
    isDefault: true,
    permissions: {
      revenue: { view: false, export: false },
      gstTracker: { view: false },
      expenseTracker: { view: false, create: false, edit: false, delete: false },
      employees: { view: false, viewDetails: true, create: false, edit: false, delete: false },
      payroll: { view: false, generate: false, viewDeductions: false, markPaid: false, downloadOwn: true },
      taxManagement: { view: false, edit: false },
      internBatches: { view: false, create: false, edit: false, delete: false, assignMentor: false },
      internRegistrations: { view: false, approve: false, reject: false },
      internSelf: { viewProfile: false, viewSchedule: false, viewMilestones: false, submitWork: false, viewFeedback: false, downloadCertificate: false, viewOfferLetter: false },
      mentorTools: { viewAssignedBatches: false, viewInternProfiles: false, markAttendance: false, giveFeedback: false, flagAtRisk: false, completeMilestone: false },
      announcements: { view: true, create: false, edit: false, delete: false },
      mailSystem: { sendOfferLetter: false, sendCertificate: false, sendPayslip: false, sendCustomMail: false, configureSmtp: false },
      profileManagement: { view: false, create: false, edit: false, delete: false, assignToUser: false },
    },
  },
  {
    label: 'Intern',
    isDefault: true,
    permissions: {
      revenue: { view: false, export: false },
      gstTracker: { view: false },
      expenseTracker: { view: false, create: false, edit: false, delete: false },
      employees: { view: false, viewDetails: false, create: false, edit: false, delete: false },
      payroll: { view: false, generate: false, viewDeductions: false, markPaid: false, downloadOwn: false },
      taxManagement: { view: false, edit: false },
      internBatches: { view: false, create: false, edit: false, delete: false, assignMentor: false },
      internRegistrations: { view: false, approve: false, reject: false },
      internSelf: { viewProfile: true, viewSchedule: true, viewMilestones: true, submitWork: true, viewFeedback: true, downloadCertificate: true, viewOfferLetter: true },
      mentorTools: { viewAssignedBatches: false, viewInternProfiles: false, markAttendance: false, giveFeedback: false, flagAtRisk: false, completeMilestone: false },
      announcements: { view: true, create: false, edit: false, delete: false },
      mailSystem: { sendOfferLetter: false, sendCertificate: false, sendPayslip: false, sendCustomMail: false, configureSmtp: false },
      profileManagement: { view: false, create: false, edit: false, delete: false, assignToUser: false },
    },
  },
];

const seed = async () => {
  await connectDB();

  console.log('🌱 Starting database seed...');

  // ── Seed Profiles ────────────────────────────────────────────────────────────
  let adminProfile = null;
  for (const profileData of defaultProfiles) {
    const existing = await Profile.findOne({ label: profileData.label });
    if (existing) {
      console.log(`  ✓ Profile already exists: ${profileData.label}`);
      if (profileData.label === 'CEO / Admin') adminProfile = existing;
    } else {
      const created = await Profile.create(profileData);
      console.log(`  ✅ Created profile: ${profileData.label}`);
      if (profileData.label === 'CEO / Admin') adminProfile = created;
    }
  }

  // ── Seed Admin User ──────────────────────────────────────────────────────────
  const adminEmail = 'admin@ofzen.in';
  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    console.log(`  ✓ Admin user already exists: ${adminEmail}`);
  } else {
    await User.create({
      name: 'Ofzen Admin',
      email: adminEmail,
      password: 'Admin@123456',   // User MUST change this on first login
      phone: '',
      profileId: adminProfile._id,
      isActive: true,
    });
    console.log(`  ✅ Created admin user: ${adminEmail} (password: Admin@123456)`);
    console.log('  ⚠️  IMPORTANT: Change the admin password immediately after first login!');
  }

  console.log('\n🎉 Seed complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
