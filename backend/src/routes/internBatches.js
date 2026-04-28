const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const {
  getBatches, getBatchById, createBatch, updateBatch,
  getInterns, getInternById, createIntern, approveIntern, rejectIntern,
  onboardBatch, bulkMarkWeekCompleted,
} = require('../controllers/internController');

router.use(protect);

// Batches
router.get('/', checkPermission('internBatches.view'), getBatches);
router.post('/', checkPermission('internBatches.create'), createBatch);
router.get('/:id', checkPermission('internBatches.view'), getBatchById);
router.put('/:id', checkPermission('internBatches.edit'), updateBatch);
router.put('/:id/onboard', checkPermission('internBatches.edit'), onboardBatch);
router.put('/:id/bulk-mark-week', checkPermission('mentorTools.markAttendance'), bulkMarkWeekCompleted);

module.exports = router;
