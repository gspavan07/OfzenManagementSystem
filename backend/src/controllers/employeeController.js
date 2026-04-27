const asyncHandler = require('express-async-handler');
const Employee = require('../models/Employee');
const User = require('../models/User');

// GET /api/employees
const getEmployees = asyncHandler(async (req, res) => {
  const { search, department, isActive } = req.query;
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (department) filter.department = { $regex: department, $options: 'i' };

  let employees = await Employee.find(filter)
    .populate('userId', 'name email phone')
    .sort({ createdAt: -1 });

  if (search) {
    employees = employees.filter(
      (e) =>
        e.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.employeeCode?.toLowerCase().includes(search.toLowerCase()) ||
        e.designation?.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.json({ success: true, employees });
});

// GET /api/employees/:id
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id)
    .populate('userId', 'name email phone joinDate profileId');

  if (!employee) { res.status(404); throw new Error('Employee not found'); }
  res.json({ success: true, employee });
});

// POST /api/employees
const createEmployee = asyncHandler(async (req, res) => {
  const { userId, designation, department, employeeCode, salary, deductions, bankAccount, panNumber, aadharNumber, address, emergencyContact, joinDate } = req.body;

  if (!userId || !designation || !department || !employeeCode) {
    res.status(400);
    throw new Error('userId, designation, department, and employeeCode are required');
  }

  const exists = await Employee.findOne({ userId });
  if (exists) { res.status(409); throw new Error('Employee record already exists for this user'); }

  const codeExists = await Employee.findOne({ employeeCode: employeeCode.toUpperCase() });
  if (codeExists) { res.status(409); throw new Error('Employee code already in use'); }

  const employee = await Employee.create({
    userId, designation, department, employeeCode, salary, deductions, bankAccount, panNumber, aadharNumber, address, emergencyContact, joinDate,
  });

  await employee.populate('userId', 'name email');
  res.status(201).json({ success: true, employee });
});

// PUT /api/employees/:id
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) { res.status(404); throw new Error('Employee not found'); }

  const fields = ['designation', 'department', 'salary', 'deductions', 'bankAccount', 'panNumber', 'aadharNumber', 'address', 'emergencyContact', 'joinDate', 'isActive'];
  fields.forEach((f) => { if (req.body[f] !== undefined) employee[f] = req.body[f]; });

  const updated = await employee.save();
  await updated.populate('userId', 'name email');
  res.json({ success: true, employee: updated });
});

// GET /api/employees/me
const getMyEmployeeProfile = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne({ userId: req.user.id })
    .populate('userId', 'name email phone joinDate profileId');

  res.json({ success: true, employee: employee || null });
});

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, getMyEmployeeProfile };
