const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const {
  getInternships,
  createInternship,
  updateInternship,
  deleteInternship,
} = require('../controllers/internshipController');

router.use(protect);

router.get('/', checkPermission('internBatches.view'), getInternships);
router.post('/', checkPermission('internBatches.create'), createInternship);
router.put('/:id', checkPermission('internBatches.edit'), updateInternship);
router.delete('/:id', checkPermission('internBatches.delete'), deleteInternship);

module.exports = router;
