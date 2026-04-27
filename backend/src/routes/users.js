const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');
const { getUsers, getUserById, createUser, updateUser, deactivateUser } = require('../controllers/userController');

router.use(protect);

router.get('/', checkPermission('employees.view'), getUsers);
router.post('/', checkPermission('employees.create'), createUser);
router.get('/:id', checkPermission('employees.viewDetails'), getUserById);
router.put('/:id', checkPermission('employees.edit'), updateUser);
router.delete('/:id', checkPermission('employees.delete'), deactivateUser);

module.exports = router;
