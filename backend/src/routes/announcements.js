const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require('../controllers/announcementController');

router.use(protect);

router.get('/', checkPermission('announcements.view'), getAnnouncements);
router.post('/', checkPermission('announcements.create'), createAnnouncement);
router.put('/:id', checkPermission('announcements.edit'), updateAnnouncement);
router.delete('/:id', checkPermission('announcements.delete'), deleteAnnouncement);

module.exports = router;
