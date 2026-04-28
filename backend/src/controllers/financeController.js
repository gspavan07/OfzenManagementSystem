const asyncHandler = require('express-async-handler');
const Revenue = require('../models/Revenue');
const Expense = require('../models/Expense');

const GST_LIMIT = 2000000;      // ₹20,00,000
const GST_WARNING = 1600000;    // ₹16,00,000
const INTERN_FEE = 899;

// ─── REVENUE ──────────────────────────────────────────────────────────────────

// GET /api/finance/revenue?year=
const getRevenue = asyncHandler(async (req, res) => {
  const { year, month, category } = req.query;
  const filter = {};
  
  if (category && category !== 'All') {
    filter.category = category;
  }

  if (year) {
    if (month && month !== 'All') {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    } else {
      const start = new Date(Number(year), 0, 1);
      const end = new Date(Number(year), 11, 31, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }
  }

  const revenue = await Revenue.find(filter).sort({ date: -1 }).lean();

  // ─── Inject Aggregated Intern Revenue ────────────────────────────────────────
  const Intern = require('../models/Intern');
  const InternBatch = require('../models/InternBatch');

  // 1. Get batches for fee info
  const batches = await InternBatch.find().populate('internshipId', 'fee').lean();
  const batchFeeMap = batches.reduce((acc, b) => { 
    acc[b._id.toString()] = b.internshipId?.fee || 0; 
    return acc; 
  }, {});

  // 2. Find paid interns within the filtered date range (if any)
  const internFilter = { paymentStatus: 'paid' };
  if (filter.date) internFilter.createdAt = filter.date;

  const paidInterns = await Intern.find(internFilter).lean();
  
  // 3. Group by Month/Year
  const monthlyInternRev = {};
  paidInterns.forEach(intern => {
    const date = new Date(intern.createdAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`; // Month is 0-indexed
    if (!monthlyInternRev[key]) {
      monthlyInternRev[key] = {
        _id: `intern-rev-${key}`,
        date: new Date(date.getFullYear(), date.getMonth(), 1), // 1st of month
        category: 'Internships',
        title: `Internship Intake - ${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`,
        totalCollected: 0,
        numberOfStudents: 0,
        gstApplicable: false, // Usually no GST on small fees or handled separately
        isVirtual: true // Mark as virtual/automated
      };
    }
    monthlyInternRev[key].totalCollected += (batchFeeMap[intern.batchId?.toString()] || 0);
    monthlyInternRev[key].numberOfStudents += 1;
  });

  // 4. Merge and Sort
  const combinedRevenue = [...revenue, ...Object.values(monthlyInternRev)]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ success: true, revenue: combinedRevenue });
});

// POST /api/finance/revenue
const createRevenue = asyncHandler(async (req, res) => {
  const { date, category, title, totalCollected, numberOfStudents, gstApplicable, gstAmount, notes } = req.body;

  if (!date || !category || totalCollected === undefined) {
    res.status(400);
    throw new Error('date, category, and totalCollected are required');
  }

  const revenue = await Revenue.create({
    date, category, title, totalCollected, numberOfStudents, gstApplicable, gstAmount, notes
  });
  
  res.status(201).json({ success: true, revenue });
});

// PUT /api/finance/revenue/:id
const updateRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findById(req.params.id);
  if (!revenue) { res.status(404); throw new Error('Revenue record not found'); }

  const fields = ['date', 'category', 'title', 'totalCollected', 'numberOfStudents', 'gstApplicable', 'gstAmount', 'notes'];
  fields.forEach(f => { if (req.body[f] !== undefined) revenue[f] = req.body[f]; });

  const updated = await revenue.save();
  res.json({ success: true, revenue: updated });
});

// DELETE /api/finance/revenue/:id
const deleteRevenue = asyncHandler(async (req, res) => {
  const revenue = await Revenue.findById(req.params.id);
  if (!revenue) { res.status(404); throw new Error('Revenue record not found'); }
  await revenue.deleteOne();
  res.json({ success: true, message: 'Revenue deleted' });
});

// GET /api/revenue/gst-status
const getGstStatus = asyncHandler(async (req, res) => {
  const currentYear = new Date().getFullYear();
  const financialYearStart = new Date().getMonth() < 3 ? currentYear - 1 : currentYear;

  // FY: April of financialYearStart to March of financialYearStart+1
  const months = await Revenue.find({
    date: {
      $gte: new Date(financialYearStart, 3, 1),
      $lte: new Date(financialYearStart + 1, 2, 31, 23, 59, 59)
    }
  });

  const totalRevenue = months.reduce((sum, m) => sum + (m.totalCollected || 0), 0);
  const studentCount = months.reduce((sum, m) => sum + (m.numberOfStudents || 0), 0);
  const percentage = Math.min((totalRevenue / GST_LIMIT) * 100, 100);

  let status = 'safe';
  if (totalRevenue >= GST_LIMIT) status = 'mandatory';
  else if (totalRevenue >= GST_WARNING) status = 'warning';

  res.json({
    success: true,
    data: {
      totalRevenue,
      studentCount,
      percentage: Math.round(percentage * 10) / 10,
      status,
      gstLimit: GST_LIMIT,
      warningThreshold: GST_WARNING,
      internFee: INTERN_FEE,
      financialYear: `${financialYearStart}-${financialYearStart + 1}`,
    },
  });
});

// ─── EXPENSES ─────────────────────────────────────────────────────────────────

// GET /api/expenses
const getExpenses = asyncHandler(async (req, res) => {
  const { month, year, category } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
    filter.date = { $gte: start, $lte: end };
  }

  const expenses = await Expense.find(filter)
    .populate('addedBy', 'name')
    .sort({ date: -1 });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  res.json({ success: true, expenses, total });
});

// POST /api/expenses
const createExpense = asyncHandler(async (req, res) => {
  const { date, category, amount, description, paidTo } = req.body;
  if (!category || amount === undefined) {
    res.status(400);
    throw new Error('category and amount are required');
  }

  const expense = await Expense.create({ date, category, amount, description, paidTo, addedBy: req.user.id });
  res.status(201).json({ success: true, expense });
});

// PUT /api/expenses/:id
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) { res.status(404); throw new Error('Expense not found'); }

  const fields = ['date', 'category', 'amount', 'description', 'paidTo'];
  fields.forEach((f) => { if (req.body[f] !== undefined) expense[f] = req.body[f]; });

  const updated = await expense.save();
  res.json({ success: true, expense: updated });
});

// DELETE /api/expenses/:id
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) { res.status(404); throw new Error('Expense not found'); }
  await expense.deleteOne();
  res.json({ success: true, message: 'Expense deleted' });
});

// GET /api/finance/dashboard-stats?year=
const getDashboardStats = asyncHandler(async (req, res) => {
  const fyStartYear = Number(req.query.year) || new Date().getFullYear();
  
  // Indian FY: April [fyStartYear] to March [fyStartYear + 1]
  const fyRange = {
    $gte: new Date(fyStartYear, 3, 1), // April 1st
    $lte: new Date(fyStartYear + 1, 2, 31, 23, 59, 59) // March 31st
  };

  const revenueData = await Revenue.find({ date: fyRange });
  const expenseData = await Expense.find({ date: fyRange });

  // ─── Intern Revenue Calculation ─────────────────────────────────────────────
  const Intern = require('../models/Intern');
  const InternBatch = require('../models/InternBatch');
  
  // 1. Get batches for fee info
  const batches = await InternBatch.find().populate('internshipId', 'fee').lean();
  const batchFeeMap = batches.reduce((acc, b) => { 
    acc[b._id.toString()] = b.internshipId?.fee || 0; 
    return acc; 
  }, {});

  // 2. Find paid interns within the FY
  const paidInterns = await Intern.find({
    paymentStatus: 'paid',
    createdAt: fyRange
  }).lean();

  const totalInternRevenue = paidInterns.reduce((sum, intern) => {
    return sum + (batchFeeMap[intern.batchId?.toString()] || 0);
  }, 0);
  // ─────────────────────────────────────────────────────────────────────────────

  const totalDirectRevenue = revenueData.reduce((sum, r) => sum + r.totalCollected, 0);
  const totalTurnover = totalDirectRevenue + totalInternRevenue;
  const totalExpenses = expenseData.reduce((sum, e) => sum + e.amount, 0);
  const totalProfit = totalTurnover - totalExpenses;
  const totalGst = revenueData.reduce((sum, r) => sum + (r.gstAmount || 0), 0);

  // Aggregated Counts
  const Employee = require('../models/Employee');
  const totalEmployees = await Employee.countDocuments({ isActive: true });
  const activeInterns = await Intern.countDocuments({ registrationStatus: 'approved' });

  // Monthly Breakdown (FY starting April)
  const monthlyBreakdown = [];
  for (let i = 0; i < 12; i++) {
    const month = ((i + 3) % 12) + 1; // 4, 5, ..., 12, 1, 2, 3
    const year = month >= 4 ? fyStartYear : fyStartYear + 1;
    
    // Direct Revenue
    const directRev = revenueData.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    }).reduce((sum, r) => sum + r.totalCollected, 0);

    // Intern Revenue for this month
    const internRev = paidInterns.filter(intern => {
      const d = new Date(intern.createdAt);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    }).reduce((sum, intern) => sum + (batchFeeMap[intern.batchId?.toString()] || 0), 0);

    const rev = directRev + internRev;
    
    const gst = revenueData.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    }).reduce((sum, r) => sum + (r.gstAmount || 0), 0);
    
    const exp = expenseData.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    }).reduce((sum, e) => sum + e.amount, 0);

    monthlyBreakdown.push({
      month,
      year,
      revenue: rev,
      expenses: exp,
      profit: rev - exp,
      gst: gst,
      internRevenue: internRev,
      directRevenue: directRev
    });
  }

  res.json({
    success: true,
    stats: {
      totalTurnover,
      totalInternRevenue,
      totalDirectRevenue,
      totalExpenses,
      totalProfit,
      totalGst,
      totalEmployees,
      activeInterns,
      monthlyBreakdown
    }
  });
});


// GET /api/finance/intern-revenue
const getInternRevenue = asyncHandler(async (req, res) => {
  const Intern = require('../models/Intern');
  const InternBatch = require('../models/InternBatch');

  // 1. Get all batches to map batchId to fee
  const batches = await InternBatch.find().populate('internshipId', 'fee domain').lean();
  const batchFeeMap = batches.reduce((acc, b) => {
    acc[b._id.toString()] = { 
      fee: b.internshipId?.fee || 0, 
      name: b.batchName, 
      domain: b.internshipId?.domain || 'Unknown' 
    };
    return acc;
  }, {});

  // 2. Get all paid interns
  const paidInterns = await Intern.find({ paymentStatus: 'paid' }).lean();

  // 3. Process data month-wise and batch-wise
  const monthlyData = {};
  const batchData = {};
  let totalRevenue = 0;

  paidInterns.forEach(intern => {
    const batchIdStr = intern.batchId?.toString();
    const batchInfo = batchFeeMap[batchIdStr] || { fee: 0, name: 'Unknown', domain: 'Unknown' };
    const fee = batchInfo.fee;
    const date = new Date(intern.createdAt);
    
    // Sortable key YYYY-MM
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    totalRevenue += fee;

    // Monthly aggregation
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { 
        key: monthKey,
        month: date.getMonth() + 1, 
        year: date.getFullYear(), 
        amount: 0, 
        count: 0 
      };
    }
    monthlyData[monthKey].amount += fee;
    monthlyData[monthKey].count += 1;

    // Batch aggregation
    const bId = batchIdStr || 'unknown';
    if (!batchData[bId]) {
      batchData[bId] = { 
        name: batchInfo.name, 
        domain: batchInfo.domain, 
        amount: 0, 
        count: 0 
      };
    }
    batchData[bId].amount += fee;
    batchData[bId].count += 1;
  });

  res.json({
    success: true,
    data: {
      totalRevenue,
      monthly: Object.values(monthlyData).sort((a, b) => b.key.localeCompare(a.key)),
      batchWise: Object.values(batchData).sort((a, b) => b.amount - a.amount)
    }
  });
});

module.exports = { 
  getRevenue, 
  createRevenue, 
  updateRevenue, 
  deleteRevenue, 
  getGstStatus, 
  getExpenses, 
  createExpense, 
  updateExpense, 
  deleteExpense, 
  getDashboardStats,
  getInternRevenue
};
