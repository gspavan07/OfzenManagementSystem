const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { getProfiles, getProfileById, createProfile, updateProfile, deleteProfile, cloneProfile, assignProfileToUser } = require('../controllers/profileController');

router.use(protect);

router.get('/', checkPermission('profileManagement.view'), getProfiles);
router.post('/', checkPermission('profileManagement.create'), createProfile);
router.get('/:id', checkPermission('profileManagement.view'), getProfileById);
router.put('/:id', checkPermission('profileManagement.edit'), updateProfile);
router.delete('/:id', checkPermission('profileManagement.delete'), deleteProfile);
router.post('/:id/clone', checkPermission('profileManagement.create'), cloneProfile);
router.put('/assign', checkPermission('profileManagement.assignToUser'), assignProfileToUser);

module.exports = router;
