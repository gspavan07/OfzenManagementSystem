const path = require('path');
const { generatePdfFromHtml } = require('../../utils/pdfGenerator');

/**
 * Generate Payslip HTML.
 */
const generatePayslipHtml = (data) => {
  const { employee, payslip } = data;

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const monthLabel = `${monthNames[payslip.month]} ${payslip.year}`;
  const employeeName = employee.userId?.name || 'Employee';
  const companyName = process.env.COMPANY_NAME || 'Ofzen Technologies';
  const companyAddress = process.env.COMPANY_ADDRESS || 'Kakinada, Andhra Pradesh';

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n || 0);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; color: #1a1a2e; background: #fff; }
  .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; }
  .company-name { font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
  .company-sub { font-size: 11px; opacity: 0.75; margin-top: 4px; }
  .payslip-label { font-size: 13px; font-weight: 600; background: rgba(255,255,255,0.15); padding: 6px 14px; border-radius: 20px; }
  .meta-section { padding: 20px 30px; background: #f8f9ff; border-bottom: 2px solid #e8ecf8; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .meta-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; font-weight: 600; }
  .meta-item .value { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-top: 3px; }
  .body { padding: 20px 30px; }
  .columns { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  table { width: 100%; border-collapse: collapse; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; padding: 8px 12px; background: #f0f0ff; border-left: 3px solid #6366f1; margin-bottom: 0; }
  tr:nth-child(even) td { background: #fafafa; }
  td { padding: 7px 12px; border-bottom: 1px solid #f0f0f0; }
  td:last-child { text-align: right; font-weight: 500; }
  .total-row td { background: #f0f0ff !important; font-weight: 700; border-top: 2px solid #6366f1; }
  .net-pay-box { margin: 20px 0; background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 16px 30px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
  .net-pay-label { font-size: 13px; opacity: 0.85; }
  .net-pay-amount { font-size: 26px; font-weight: 800; }
  .employer-section { margin-top: 16px; padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; }
  .employer-section h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #92400e; margin-bottom: 8px; }
  .employer-row { display: flex; justify-content: space-between; font-size: 12px; padding: 3px 0; }
  .footer { margin-top: 24px; padding: 14px 30px; background: #f8f9ff; border-top: 1px solid #e8ecf8; font-size: 10px; color: #9ca3af; text-align: center; }
  .attendance { display: flex; gap: 20px; margin-top: 12px; }
  .att-box { flex: 1; background: #f8f9ff; border-radius: 6px; padding: 10px 14px; text-align: center; }
  .att-box .num { font-size: 22px; font-weight: 700; color: #6366f1; }
  .att-box .lbl { font-size: 10px; color: #6b7280; text-transform: uppercase; }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="company-name">${companyName}</div>
    <div class="company-sub">${companyAddress} | ${process.env.COMPANY_WEBSITE || 'www.ofzen.in'}</div>
  </div>
  <div class="payslip-label">SALARY SLIP — ${monthLabel.toUpperCase()}</div>
</div>

<div class="meta-section">
  <div class="meta-item"><label>Employee Name</label><div class="value">${employeeName}</div></div>
  <div class="meta-item"><label>Employee Code</label><div class="value">${employee.employeeCode}</div></div>
  <div class="meta-item"><label>Designation</label><div class="value">${employee.designation}</div></div>
  <div class="meta-item"><label>Department</label><div class="value">${employee.department}</div></div>
  <div class="meta-item"><label>Pay Period</label><div class="value">${monthLabel}</div></div>
  <div class="meta-item"><label>Payment Status</label><div class="value">${payslip.status === 'paid' ? '✅ Paid' : '⏳ Pending'}</div></div>
</div>

<div class="body">
  <!-- Attendance -->
  <div class="attendance">
    <div class="att-box"><div class="num">${payslip.workingDays}</div><div class="lbl">Working Days</div></div>
    <div class="att-box"><div class="num">${payslip.presentDays}</div><div class="lbl">Days Present</div></div>
    <div class="att-box"><div class="num">${payslip.workingDays - payslip.presentDays}</div><div class="lbl">Days Absent</div></div>
  </div>

  <div style="margin-top:20px" class="columns">
    <!-- Earnings -->
    <div>
      <div class="section-title">Earnings</div>
      <table>
        <tr><td>Basic Salary</td><td>${fmt(payslip.earnings.basic)}</td></tr>
        <tr><td>HRA</td><td>${fmt(payslip.earnings.hra)}</td></tr>
        <tr><td>Travel Allowance</td><td>${fmt(payslip.earnings.travelAllowance)}</td></tr>
        <tr><td>Medical Allowance</td><td>${fmt(payslip.earnings.medicalAllowance)}</td></tr>
        <tr><td>Other Allowance</td><td>${fmt(payslip.earnings.otherAllowance)}</td></tr>
        <tr class="total-row"><td>Gross Earnings</td><td>${fmt(payslip.earnings.grossEarnings)}</td></tr>
      </table>
    </div>

    <!-- Deductions -->
    <div>
      <div class="section-title">Deductions</div>
      <table>
        <tr><td>Provident Fund (PF)</td><td>${fmt(payslip.deductions.pf)}</td></tr>
        <tr><td>ESI</td><td>${fmt(payslip.deductions.esi)}</td></tr>
        <tr><td>TDS</td><td>${fmt(payslip.deductions.tds)}</td></tr>
        <tr><td>Professional Tax (PT)</td><td>${fmt(payslip.deductions.pt)}</td></tr>
        <tr><td>Labour Welfare Fund</td><td>${fmt(payslip.deductions.lwf)}</td></tr>
        <tr><td>Loan Recovery</td><td>${fmt(payslip.deductions.loanRecovery)}</td></tr>
        <tr><td>Other Deductions</td><td>${fmt(payslip.deductions.otherDeductions)}</td></tr>
        <tr class="total-row"><td>Total Deductions</td><td>${fmt(payslip.deductions.totalDeductions)}</td></tr>
      </table>
    </div>
  </div>

  <!-- Net Pay -->
  <div class="net-pay-box">
    <div>
      <div class="net-pay-label">Net Pay (Take Home)</div>
      <div style="font-size:11px;opacity:0.7;margin-top:3px;">Gross Earnings − Total Deductions</div>
    </div>
    <div class="net-pay-amount">${fmt(payslip.netPay)}</div>
  </div>

  <!-- Employer Contributions Reference -->
  ${(payslip.employerContributions?.pf || payslip.employerContributions?.esi) ? `
  <div class="employer-section">
    <h4>⚠️ Employer Contributions (For Reference Only — Not Deducted From Salary)</h4>
    <div class="employer-row"><span>Employer PF (12% of Basic)</span><span>${fmt(payslip.employerContributions.pf)}</span></div>
    <div class="employer-row"><span>Employer ESI (3.25% of Gross)</span><span>${fmt(payslip.employerContributions.esi)}</span></div>
    ${payslip.employerContributions.lwf ? `<div class="employer-row"><span>Employer LWF (Annual)</span><span>${fmt(payslip.employerContributions.lwf)}</span></div>` : ''}
  </div>` : ''}
</div>

<div class="footer">
  This is a computer-generated salary slip and does not require a signature. | ${companyName} | ${process.env.COMPANY_WEBSITE || 'www.ofzen.in'}
</div>
</body>
</html>`;
};

/**
 * Generate a payslip PDF.
 * @param {object} data
 * @param {object} data.employee  - Employee document (populated with userId.name)
 * @param {object} data.payslip   - Payslip document with earnings/deductions
 * @param {string} data.outputDir - Directory to save the file
 * @returns {string} Full path to the generated PDF
 */
const generatePayslipPdf = async (data) => {
  const { employee, payslip, outputDir } = data;
  const html = generatePayslipHtml(data);

  const filename = `payslip_${employee.employeeCode}_${payslip.year}_${String(payslip.month).padStart(2, '0')}.pdf`;
  const outputPath = path.join(outputDir, filename);

  await generatePdfFromHtml(html, outputPath);
  return outputPath;
};

module.exports = { generatePayslipPdf, generatePayslipHtml };
