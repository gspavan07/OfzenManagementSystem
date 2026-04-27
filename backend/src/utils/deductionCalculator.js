const { AP_PROFESSIONAL_TAX, AP_LWF, PF, ESI } = require('../config/constants');

/**
 * Calculate all deductions for a payslip.
 *
 * @param {object} employee - Employee document with salary + deductions config
 * @param {number} month - 1-12
 * @param {number} year
 * @param {object} overrides - Optional: { loanRecovery, otherDeductions, workingDays, presentDays }
 * @returns {object} { earnings, deductions, employerContributions, netPay, workingDays, presentDays }
 */
const calculatePayslip = (employee, month, year, overrides = {}) => {
  const s = employee.salary;
  const d = employee.deductions;

  // ── Earnings ────────────────────────────────────────────────────────────────
  const basic = s.basic || 0;
  const hra = s.hra || 0;
  const travelAllowance = s.travelAllowance || 0;
  const medicalAllowance = s.medicalAllowance || 0;
  const otherAllowance = s.otherAllowance || 0;
  const grossEarnings = basic + hra + travelAllowance + medicalAllowance + otherAllowance;

  // ── PF (Provident Fund) ─────────────────────────────────────────────────────
  // PF is on basic, capped at ₹15,000 basic for PF calculation
  const pfBase = Math.min(basic, 15000);
  const pf = d.pfApplicable ? Math.round(pfBase * PF.employeeRate) : 0;
  const pfEmployer = d.pfApplicable ? Math.round(pfBase * PF.employerRate) : 0;

  // ── ESI ─────────────────────────────────────────────────────────────────────
  // Only if gross ≤ ₹21,000
  const esiEligible = d.esiApplicable && grossEarnings <= ESI.grossSalaryLimit;
  const esi = esiEligible ? Math.round(grossEarnings * ESI.employeeRate) : 0;
  const esiEmployer = esiEligible ? Math.round(grossEarnings * ESI.employerRate) : 0;

  // ── Professional Tax (Andhra Pradesh) ───────────────────────────────────────
  let pt = 0;
  if (d.ptApplicable) {
    const isMarch = month === 3;
    if (grossEarnings <= 15000) {
      pt = AP_PROFESSIONAL_TAX.slabs[0].monthly; // 0
    } else if (grossEarnings <= 20000) {
      pt = AP_PROFESSIONAL_TAX.slabs[1].monthly; // 150
    } else {
      pt = isMarch
        ? AP_PROFESSIONAL_TAX.marchAmount   // 300 in March
        : AP_PROFESSIONAL_TAX.slabs[2].monthly; // 200 other months
    }
  }

  // ── LWF (Andhra Pradesh) — deduct only in December ──────────────────────────
  let lwf = 0;
  if (d.lwfApplicable && month === AP_LWF.deductionMonth) {
    lwf = AP_LWF.employeeAnnual; // ₹30/year, deducted in December
  }

  // ── TDS ─────────────────────────────────────────────────────────────────────
  const tds = d.tdsApplicable
    ? Math.round(basic * ((d.tdsPercent || 0) / 100))
    : 0;

  // ── Optional overrides ───────────────────────────────────────────────────────
  const loanRecovery = overrides.loanRecovery || 0;
  const otherDeductions = overrides.otherDeductions || 0;

  // ── Totals ───────────────────────────────────────────────────────────────────
  const totalDeductions = pf + esi + tds + pt + lwf + loanRecovery + otherDeductions;
  const netPay = grossEarnings - totalDeductions;

  return {
    earnings: {
      basic,
      hra,
      travelAllowance,
      medicalAllowance,
      otherAllowance,
      grossEarnings,
    },
    deductions: {
      tds,
      pf,
      esi,
      pt,
      lwf,
      loanRecovery,
      otherDeductions,
      totalDeductions,
    },
    employerContributions: {
      pf: pfEmployer,
      esi: esiEmployer,
      lwf: d.lwfApplicable && month === AP_LWF.deductionMonth ? AP_LWF.employerAnnual : 0,
    },
    netPay,
    workingDays: overrides.workingDays || 0,
    presentDays: overrides.presentDays || 0,
  };
};

module.exports = { calculatePayslip };
