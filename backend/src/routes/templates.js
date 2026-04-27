const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkAnyPermission } = require('../middleware/checkPermission');
const { previewTemplate } = require('../controllers/templateController');

// All routes are protected
router.use(protect);

// Users who can send these documents can also preview them
router.get(
  '/preview/:templateType',
  checkAnyPermission([
    'mailSystem.sendOfferLetter',
    'mailSystem.sendCertificate',
    'mailSystem.sendPayslip',
    'profileManagement.view'
  ]),
  previewTemplate
);

module.exports = router;
