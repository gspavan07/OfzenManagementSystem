const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, getMyEmployeeProfile } = require('../controllers/employeeController');

router.use(protect);

router.get('/me', getMyEmployeeProfile); // Must be before /:id
router.get('/', checkPermission('employees.view'), getEmployees);
router.post('/', checkPermission('employees.create'), createEmployee);
router.get('/:id', checkPermission('employees.viewDetails'), getEmployeeById);
router.put('/:id', checkPermission('employees.edit'), updateEmployee);

module.exports = router;
