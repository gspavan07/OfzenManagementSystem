const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission, checkAnyPermission } = require('../middleware/checkPermission');
const { getPayroll, getPayslipById, generatePayslip, markPaid, downloadPayslipPdf, getMyPayslips } = require('../controllers/payrollController');

router.use(protect);

router.get('/me/payslips', getMyPayslips); // Must be before /:id
router.get('/', checkPermission('payroll.view'), getPayroll);
router.post('/generate', checkPermission('payroll.generate'), generatePayslip);
router.get('/:id', checkAnyPermission(['payroll.view', 'payroll.downloadOwn']), getPayslipById);
router.put('/:id/mark-paid', checkPermission('payroll.markPaid'), markPaid);
router.get('/:id/pdf', checkAnyPermission(['payroll.generate', 'payroll.downloadOwn']), downloadPayslipPdf);

module.exports = router;
