const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { getRevenue, createRevenue, updateRevenue, deleteRevenue, getGstStatus, getExpenses, createExpense, updateExpense, deleteExpense, getDashboardStats, getInternRevenue } = require('../controllers/financeController');

router.use(protect);

// Dashboard
router.get('/dashboard-stats', checkPermission('revenue.view'), getDashboardStats);

// Revenue
router.get('/revenue', checkPermission('revenue.view'), getRevenue);
router.post('/revenue', checkPermission('revenue.view'), createRevenue);
router.put('/revenue/:id', checkPermission('revenue.view'), updateRevenue);
router.delete('/revenue/:id', checkPermission('revenue.view'), deleteRevenue);
router.get('/revenue/gst-status', checkPermission('gstTracker.view'), getGstStatus);
router.get('/intern-revenue', checkPermission('revenue.view'), getInternRevenue);

// Expenses
router.get('/expenses', checkPermission('expenseTracker.view'), getExpenses);
router.post('/expenses', checkPermission('expenseTracker.create'), createExpense);
router.put('/expenses/:id', checkPermission('expenseTracker.edit'), updateExpense);
router.delete('/expenses/:id', checkPermission('expenseTracker.delete'), deleteExpense);

module.exports = router;
