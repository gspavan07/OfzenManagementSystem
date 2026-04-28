const asyncHandler = require('express-async-handler');
const path = require('path');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const { calculatePayslip } = require('../utils/deductionCalculator');
const { generatePayslipPdf } = require('../templates/payslip/payslipTemplate');

const PDF_DIR = path.join(__dirname, '../../uploads/pdfs');

// GET /api/payroll?month=&year=
const getPayroll = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const filter = {};
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  const payslips = await Payslip.find(filter)
    .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name email' } })
    .sort({ year: -1, month: -1 });

  // Sanitize paths
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  const sanitizedPayslips = payslips.map(p => {
    const obj = p.toObject();
    if (obj.pdfUrl && typeof obj.pdfUrl === 'string' && !obj.pdfUrl.startsWith('http')) {
      obj.pdfUrl = `${baseUrl}${obj.pdfUrl.startsWith('/') ? '' : '/'}${obj.pdfUrl}`;
    }
    return obj;
  });

  res.json({ success: true, payslips: sanitizedPayslips });
});

// GET /api/payroll/:id
const getPayslipById = asyncHandler(async (req, res) => {
  const payslip = await Payslip.findById(req.params.id)
    .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name email phone' } });

  if (!payslip) { res.status(404); throw new Error('Payslip not found'); }
  
  // Sanitize path
  const obj = payslip.toObject();
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  if (obj.pdfUrl && typeof obj.pdfUrl === 'string' && !obj.pdfUrl.startsWith('http')) {
    obj.pdfUrl = `${baseUrl}${obj.pdfUrl.startsWith('/') ? '' : '/'}${obj.pdfUrl}`;
  }

  res.json({ success: true, payslip: obj });
});

// POST /api/payroll/generate
const generatePayslip = asyncHandler(async (req, res) => {
  const { employeeId, month, year, workingDays, presentDays, loanRecovery, otherDeductions } = req.body;

  if (!employeeId || !month || !year) {
    res.status(400);
    throw new Error('employeeId, month, and year are required');
  }

  const employee = await Employee.findById(employeeId).populate('userId', 'name email');
  if (!employee) { res.status(404); throw new Error('Employee not found'); }

  const existing = await Payslip.findOne({ employeeId, month: Number(month), year: Number(year) });
  if (existing) { res.status(409); throw new Error('Payslip already exists for this month/year'); }

  // Calculate all deductions
  const calc = calculatePayslip(employee, Number(month), Number(year), {
    workingDays: Number(workingDays) || 0,
    presentDays: Number(presentDays) || 0,
    loanRecovery: Number(loanRecovery) || 0,
    otherDeductions: Number(otherDeductions) || 0,
  });

  const payslip = await Payslip.create({
    employeeId,
    month: Number(month),
    year: Number(year),
    ...calc,
    status: 'generated',
    generatedAt: new Date(),
  });

  // Generate PDF
  try {
    const { fullUrl } = await generatePayslipPdf({
      employee,
      payslip: payslip.toObject(),
      outputDir: PDF_DIR,
    });
    payslip.pdfUrl = fullUrl;
    await payslip.save();
  } catch (pdfErr) {
    console.error('PDF generation failed (non-blocking):', pdfErr.message);
  }

  res.status(201).json({ success: true, payslip });
});

// PUT /api/payroll/:id/mark-paid
const markPaid = asyncHandler(async (req, res) => {
  const payslip = await Payslip.findById(req.params.id)
    .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name' } });
    
  if (!payslip) { res.status(404); throw new Error('Payslip not found'); }
  if (payslip.status === 'paid') { res.status(400); throw new Error('Already marked as paid'); }

  payslip.status = 'paid';
  payslip.paidOn = new Date();
  await payslip.save();

  // ─── Automate Expense Logging ───────────────────────────────────────────────
  try {
    const Expense = require('../models/Expense');
    const monthName = new Date(2000, payslip.month - 1).toLocaleString('default', { month: 'long' });
    const empName = payslip.employeeId?.userId?.name || 'Employee';
    
    await Expense.create({
      date: new Date(),
      category: 'Salary',
      amount: payslip.netPay,
      description: `Salary Payout for ${empName} - ${monthName} ${payslip.year}`,
      paidTo: empName,
      addedBy: req.user.id, // Logged by the admin who clicked "Mark Paid"
    });
  } catch (expErr) {
    console.error('Automated expense logging failed:', expErr.message);
    // We don't throw here to avoid blocking the payslip status update
  }

  res.json({ success: true, payslip });
});

// GET /api/payroll/:id/pdf
const downloadPayslipPdf = asyncHandler(async (req, res) => {
  const payslip = await Payslip.findById(req.params.id)
    .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name email' } });

  if (!payslip) { res.status(404); throw new Error('Payslip not found'); }

  // Permission: only own payslip if downloadOwn, or full payroll.generate
  const employee = payslip.employeeId;
  if (
    !req.user.permissions?.payroll?.generate &&
    req.user.permissions?.payroll?.downloadOwn
  ) {
    if (employee.userId._id.toString() !== req.user.id) {
      res.status(403);
      throw new Error('Forbidden — you can only download your own payslip');
    }
  }

  if (!payslip.pdfUrl) {
    // Re-generate PDF on demand
    const { fullUrl } = await generatePayslipPdf({
      employee,
      payslip: payslip.toObject(),
      outputDir: PDF_DIR,
    });
    payslip.pdfUrl = fullUrl;
    await payslip.save();
  }

  // extract filename from URL or path
  const filename = payslip.pdfUrl.split('/').pop();
  const absolutePath = path.join(PDF_DIR, filename);
  res.download(absolutePath);
});

// GET /api/payroll/me/payslips
const getMyPayslips = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user.id });
  if (!employee) {
    return res.json({ success: true, payslips: [] });
  }

  const payslips = await Payslip.find({ employeeId: employee._id })
    .select('month year netPay status pdfUrl generatedAt')
    .sort({ year: -1, month: -1 });

  // Sanitize paths
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  const sanitizedPayslips = payslips.map(p => {
    const obj = p.toObject();
    if (obj.pdfUrl && typeof obj.pdfUrl === 'string' && !obj.pdfUrl.startsWith('http')) {
      obj.pdfUrl = `${baseUrl}${obj.pdfUrl.startsWith('/') ? '' : '/'}${obj.pdfUrl}`;
    }
    return obj;
  });

  res.json({ success: true, payslips: sanitizedPayslips });
});

module.exports = { getPayroll, getPayslipById, generatePayslip, markPaid, downloadPayslipPdf, getMyPayslips };
