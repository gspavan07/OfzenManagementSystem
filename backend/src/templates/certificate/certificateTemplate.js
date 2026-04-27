const path = require('path');
const { generatePdfFromHtml } = require('../../utils/pdfGenerator');

/**
 * Generate Certificate HTML.
 */
const generateCertificateHtml = (data) => {
  const { user, batch, certificate } = data;

  const companyName = process.env.COMPANY_NAME || 'Ofzen Technologies';
  const companyWebsite = process.env.COMPANY_WEBSITE || 'www.ofzen.in';
  const certVerifyBase = process.env.CERT_VERIFY_BASE_URL || 'http://localhost:5173';
  const verifyUrl = `${certVerifyBase}/verify/${certificate.certificateId}`;

  const issueDate = new Date(certificate.issueDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Georgia', 'Times New Roman', serif; background: #fff; color: #1a1a2e; }
  .page { width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; position: relative; }
  .border-outer { border: 8px solid #6366f1; padding: 4px; width: 100%; }
  .border-inner { border: 2px solid #c7d2fe; padding: 40px 50px; text-align: center; }
  .logo-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 8px; }
  .company-name { font-size: 28px; font-weight: 700; color: #6366f1; letter-spacing: 1px; font-family: 'Segoe UI', sans-serif; }
  .cert-of { font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 3px; margin: 20px 0 10px; font-family: 'Segoe UI', sans-serif; }
  .cert-title { font-size: 42px; font-weight: 700; color: #1a1a2e; margin-bottom: 20px; font-style: italic; }
  .divider { width: 80px; height: 3px; background: linear-gradient(90deg, #6366f1, #a5b4fc); margin: 0 auto 20px; border-radius: 2px; }
  .presented-to { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 2px; font-family: 'Segoe UI', sans-serif; }
  .intern-name { font-size: 36px; font-weight: 700; color: #4f46e5; margin: 8px 0 16px; border-bottom: 2px solid #c7d2fe; padding-bottom: 12px; display: inline-block; }
  .body-text { font-size: 14px; color: #374151; line-height: 1.8; max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', sans-serif; }
  .domain-highlight { font-size: 18px; font-weight: 700; color: #6366f1; }
  .details-row { display: flex; justify-content: center; gap: 40px; margin: 24px 0; }
  .detail-item { text-align: center; }
  .detail-item .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9ca3af; font-family: 'Segoe UI', sans-serif; }
  .detail-item .value { font-size: 14px; font-weight: 600; color: #1a1a2e; font-family: 'Segoe UI', sans-serif; margin-top: 2px; }
  .sig-row { display: flex; justify-content: space-between; margin-top: 40px; padding: 0 40px; }
  .sig-item { text-align: center; min-width: 150px; }
  .sig-line { border-top: 1.5px solid #374151; padding-top: 6px; margin-top: 30px; font-size: 12px; font-family: 'Segoe UI', sans-serif; }
  .cert-id-box { margin-top: 20px; background: #f0f0ff; border-radius: 6px; padding: 10px 20px; display: inline-block; font-family: 'Segoe UI', sans-serif; }
  .cert-id-label { font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; }
  .cert-id-value { font-size: 16px; font-weight: 700; color: #6366f1; letter-spacing: 1px; }
  .verify-text { font-size: 10px; color: #9ca3af; margin-top: 4px; }
</style>
</head>
<body>
<div class="page">
  <div class="border-outer">
    <div class="border-inner">
      <div class="company-name">${companyName}</div>
      <div class="cert-of">Certificate of Completion</div>
      <div class="divider"></div>

      <div class="presented-to">This is to certify that</div>
      <div class="intern-name">${user.name}</div>

      <p class="body-text">
        has successfully completed the <span class="domain-highlight">${batch.domain} Internship Program</span><br>
        at ${companyName}, demonstrating dedication, technical proficiency, and a commitment to growth.
      </p>

      <div class="details-row">
        <div class="detail-item">
          <div class="label">Batch</div>
          <div class="value">${batch.batchName}</div>
        </div>
        <div class="detail-item">
          <div class="label">Duration</div>
          <div class="value">${batch.durationWeeks} Weeks</div>
        </div>
        <div class="detail-item">
          <div class="label">Issue Date</div>
          <div class="value">${issueDate}</div>
        </div>
      </div>

      <div class="cert-id-box">
        <div class="cert-id-label">Certificate ID</div>
        <div class="cert-id-value">${certificate.certificateId}</div>
        <div class="verify-text">Verify at: ${verifyUrl}</div>
      </div>

      <div class="sig-row">
        <div class="sig-item">
          <div class="sig-line">Authorized Signatory<br><strong>${companyName}</strong></div>
        </div>
        <div class="sig-item">
          <div class="sig-line">Program Mentor<br><strong>${batch.domain} Track</strong></div>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
};

/**
 * Generate a Certificate PDF for an intern.
 */
const generateCertificatePdf = async (data) => {
  const { certificate, outputDir } = data;
  const html = generateCertificateHtml(data);

  const filename = `certificate_${certificate.certificateId}.pdf`;
  const outputPath = path.join(outputDir, filename);

  await generatePdfFromHtml(html, outputPath);
  return outputPath;
};

module.exports = { generateCertificatePdf, generateCertificateHtml };
