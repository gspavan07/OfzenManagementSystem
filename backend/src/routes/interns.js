const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission, checkAnyPermission } = require('../middleware/checkPermission');
const { getInterns, getInternById, createIntern, approveIntern, rejectIntern, getInternMe } = require('../controllers/internController');
const {
  getSubmissions, createSubmission, giveFeedback,
  getAttendance, markAttendance,
  getProject, completeMilestone,
  getCertificate, generateCertificate, verifyCertificate,
} = require('../controllers/internSelfController');

// Public route — no auth
router.get('/certificates/verify/:certificateId', verifyCertificate);

router.use(protect);

// Intern CRUD
router.get('/', checkAnyPermission(['internRegistrations.view', 'mentorTools.viewInternProfiles']), getInterns);
router.get('/me', getInternMe);
router.post('/', createIntern); // open for registration
router.get('/:id', checkAnyPermission(['internRegistrations.view', 'mentorTools.viewInternProfiles', 'internSelf.viewProfile']), getInternById);
router.put('/:id/approve', checkPermission('internRegistrations.approve'), approveIntern);
router.put('/:id/reject', checkPermission('internRegistrations.reject'), rejectIntern);

// Submissions
router.get('/submissions/:internId', checkAnyPermission(['mentorTools.viewInternProfiles', 'internSelf.viewFeedback']), getSubmissions);
router.post('/submissions', checkPermission('internSelf.submitWork'), createSubmission);
router.put('/submissions/:id/feedback', checkPermission('mentorTools.giveFeedback'), giveFeedback);

// Attendance
router.get('/attendance/:batchId/:sessionDate', checkAnyPermission(['mentorTools.markAttendance', 'internSelf.viewProfile']), getAttendance);
router.post('/attendance/mark', checkPermission('mentorTools.markAttendance'), markAttendance);

// Projects
router.get('/projects/:internId', checkAnyPermission(['mentorTools.viewInternProfiles', 'internSelf.viewMilestones']), getProject);
router.put('/projects/:internId/milestone/:week', checkPermission('mentorTools.completeMilestone'), completeMilestone);

// Certificates
router.get('/certificates/:internId', checkAnyPermission(['internSelf.downloadCertificate', 'mailSystem.sendCertificate']), getCertificate);
router.post('/certificates/generate', checkPermission('mailSystem.sendCertificate'), generateCertificate);

module.exports = router;
