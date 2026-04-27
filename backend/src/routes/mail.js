const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { getMailConfig, saveMailConfig, testMailConfig, sendOfferLetter, sendPayslip, sendCustomMail, getMailLogs } = require('../controllers/mailController');

router.use(protect);

// Mail Config
router.get('/config', checkPermission('mailSystem.configureSmtp'), getMailConfig);
router.post('/config', checkPermission('mailSystem.configureSmtp'), saveMailConfig);
router.post('/config/test', checkPermission('mailSystem.configureSmtp'), testMailConfig);

// Send Mails
router.post('/send-offer-letter', checkPermission('mailSystem.sendOfferLetter'), sendOfferLetter);
router.post('/send-payslip', checkPermission('mailSystem.sendPayslip'), sendPayslip);
router.post('/send-custom', checkPermission('mailSystem.sendCustomMail'), sendCustomMail);

// Mail Logs
router.get('/logs', checkPermission('mailSystem.sendCustomMail'), getMailLogs);

module.exports = router;
