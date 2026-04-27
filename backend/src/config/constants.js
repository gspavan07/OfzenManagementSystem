// ─── AP Tax Constants (Andhra Pradesh, 2024) ──────────────────────────────────

const AP_PROFESSIONAL_TAX = {
  // Monthly PT slabs (AP Professions Tax Act, 1987)
  slabs: [
    { upTo: 15000, monthly: 0 },
    { upTo: 20000, monthly: 150 },
    { upTo: Infinity, monthly: 200 }, // ₹300 in March to keep annual = ₹2400
  ],
  // March adjustment so annual total = ₹2400 (max allowed ₹2500)
  marchAmount: 300,
};

const AP_LWF = {
  // Andhra Pradesh Labour Welfare Fund (annual, deducted in December)
  employeeAnnual: 30,
  employerAnnual: 70,
  deductionMonth: 12, // December
};

const PF = {
  employeeRate: 0.12,   // 12% of Basic
  employerRate: 0.12,   // 12% of Basic (shown for reference)
  wageLimit: 15000,     // PF calculated on max ₹15,000 basic if capped
};

const ESI = {
  grossSalaryLimit: 21000, // ESI applies if gross ≤ ₹21,000
  employeeRate: 0.0075,    // 0.75%
  employerRate: 0.0325,    // 3.25%
};

const DEFAULT_PROFILES = {
  CEO: 'CEO / Admin',
  HR: 'HR Manager',
  MENTOR: 'Mentor',
  EMPLOYEE: 'Employee',
  INTERN: 'Intern',
};

const TOKEN_EXPIRY = {
  access: '15m',
  refresh: '7d',
};

const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
};

const CERT_ID_PREFIX = 'OFZ';

module.exports = {
  AP_PROFESSIONAL_TAX,
  AP_LWF,
  PF,
  ESI,
  DEFAULT_PROFILES,
  TOKEN_EXPIRY,
  PAGINATION,
  CERT_ID_PREFIX,
};
