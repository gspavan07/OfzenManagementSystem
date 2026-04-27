import api from './axios';

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data),
  updatePassword: (data) => api.put('/auth/me/password', data),
  refresh: () => api.post('/auth/refresh'),
};

// ─── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`),
};

// ─── Profiles ──────────────────────────────────────────────────────────────────
export const profilesApi = {
  getAll: () => api.get('/profiles'),
  getById: (id) => api.get(`/profiles/${id}`),
  create: (data) => api.post('/profiles', data),
  update: (id, data) => api.put(`/profiles/${id}`, data),
  delete: (id) => api.delete(`/profiles/${id}`),
  clone: (id, data) => api.post(`/profiles/${id}/clone`, data),
  assign: (data) => api.put('/profiles/assign', data),
};

// ─── Employees ─────────────────────────────────────────────────────────────────
export const employeesApi = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  getMe: () => api.get('/employees/me'),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
};

// ─── Payroll ───────────────────────────────────────────────────────────────────
export const payrollApi = {
  getAll: (params) => api.get('/payroll', { params }),
  getById: (id) => api.get(`/payroll/${id}`),
  getMyPayslips: () => api.get('/payroll/me/payslips'),
  generate: (data) => api.post('/payroll/generate', data),
  markPaid: (id) => api.put(`/payroll/${id}/mark-paid`),
  downloadPdf: (id) => api.get(`/payroll/${id}/pdf`, { responseType: 'blob' }),
};

// ─── Finance ───────────────────────────────────────────────────────────────────
export const financeApi = {
  getRevenue: (params) => api.get('/finance/revenue', { params }),
  createRevenue: (data) => api.post('/finance/revenue', data),
  updateRevenue: (id, data) => api.put(`/finance/revenue/${id}`, data),
  deleteRevenue: (id) => api.delete(`/finance/revenue/${id}`),
  getGstStatus: () => api.get('/finance/revenue/gst-status'),
  getInternRevenue: () => api.get('/finance/intern-revenue'),
  getExpenses: (params) => api.get('/finance/expenses', { params }),
  createExpense: (data) => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.put(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  getDashboardStats: (params) => api.get('/finance/dashboard-stats', { params }),
};

// ─── Internships (Roles) ───────────────────────────────────────────────────────
export const internshipsApi = {
  getAll: (params) => api.get('/internships', { params }),
  create: (data) => api.post('/internships', data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
};

// ─── Intern Batches ────────────────────────────────────────────────────────────
export const batchesApi = {
  getAll: (params) => api.get('/intern-batches', { params }),
  getById: (id) => api.get(`/intern-batches/${id}`),
  create: (data) => api.post('/intern-batches', data),
  update: (id, data) => api.put(`/intern-batches/${id}`, data),
  onboard: (id, data) => api.put(`/intern-batches/${id}/onboard`, data),
};

// ─── Interns ───────────────────────────────────────────────────────────────────
export const internsApi = {
  getAll: (params) => api.get('/interns', { params }),
  getById: (id) => api.get(`/interns/${id}`),
  getMe: () => api.get('/interns/me'),
  create: (data) => api.post('/interns', data),
  approve: (id) => api.put(`/interns/${id}/approve`),
  reject: (id) => api.put(`/interns/${id}/reject`),
  getSubmissions: (internId) => api.get(`/interns/submissions/${internId}`),
  submitWork: (data) => api.post('/interns/submissions', data),
  giveFeedback: (submissionId, data) => api.put(`/interns/submissions/${submissionId}/feedback`, data),
  getAttendance: (batchId, sessionDate) => api.get(`/interns/attendance/${batchId}/${sessionDate}`),
  markAttendance: (data) => api.post('/interns/attendance/mark', data),
  getProject: (internId) => api.get(`/interns/projects/${internId}`),
  completeMilestone: (internId, week) => api.put(`/interns/projects/${internId}/milestone/${week}`),
  getCertificate: (internId) => api.get(`/interns/certificates/${internId}`),
  generateCertificate: (data) => api.post('/interns/certificates/generate', data),
  verifyCertificate: (certId) => api.get(`/interns/certificates/verify/${certId}`),
};

// ─── Announcements ─────────────────────────────────────────────────────────────
export const announcementsApi = {
  getAll: () => api.get('/announcements'),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

// ─── Document Templates ────────────────────────────────────────────────────────
export const templatesApi = {
  preview: (type) => api.get(`/templates/preview/${type}`, { responseType: 'blob' }),
  download: (type) => api.get(`/templates/preview/${type}?download=true`, { responseType: 'blob' }),
};

// Removed Mail API as per request
