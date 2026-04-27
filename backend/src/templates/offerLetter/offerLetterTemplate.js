const path = require("path");
const { generatePdfFromHtml } = require("../../utils/pdfGenerator");

/**
 * Generate Offer Letter HTML.
 */
const generateOfferLetterHtml = (data) => {
  const { user, batch } = data;

  const companyName = process.env.COMPANY_NAME || "Ofzen Technologies";
  const companyAddress =
    process.env.COMPANY_ADDRESS || "Kakinada, Andhra Pradesh";
  const companyWebsite = process.env.COMPANY_WEBSITE || "www.ofzen.in";
  const companyEmail = process.env.COMPANY_EMAIL || "info@ofzen.in";

  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startDate = new Date(batch.startDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const endDate = new Date(batch.endDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Georgia, serif; font-size: 13.5px; color: #1a1a2e; background: #fff; line-height: 1.7; }
  .letterhead { padding: 30px 40px 20px; border-bottom: 3px solid #6366f1; display: flex; justify-content: space-between; align-items: flex-start; }
  .company-name { font-size: 26px; font-weight: 800; color: #6366f1; letter-spacing: -0.5px; }
  .company-details { font-size: 11px; color: #6b7280; margin-top: 4px; line-height: 1.5; }
  .company-badge { background: #f0f0ff; border: 1.5px solid #6366f1; border-radius: 6px; padding: 8px 14px; text-align: right; }
  .company-badge .msme { font-size: 10px; color: #6366f1; font-weight: 700; }
  .company-badge .reg { font-size: 9px; color: #9ca3af; margin-top: 2px; }
  .body { padding: 30px 40px; }
  .date { font-size: 12px; color: #6b7280; margin-bottom: 24px; }
  .doc-title { font-size: 18px; font-weight: 700; color: #1a1a2e; text-align: center; margin-bottom: 24px; text-decoration: underline; text-decoration-color: #6366f1; text-underline-offset: 5px; }
  .salutation { margin-bottom: 16px; }
  .body-text { margin-bottom: 14px; text-align: justify; }
  .highlight-box { background: #f0f0ff; border-left: 4px solid #6366f1; padding: 14px 18px; border-radius: 0 6px 6px 0; margin: 20px 0; }
  .highlight-box table { width: 100%; }
  .highlight-box td { padding: 5px 0; }
  .highlight-box td:first-child { font-weight: 600; color: #4f46e5; width: 180px; }
  .signature-section { margin-top: 50px; display: flex; justify-content: space-between; }
  .sig-box { text-align: center; }
  .sig-line { border-top: 1px solid #1a1a2e; padding-top: 6px; margin-top: 30px; font-size: 12px; color: #374151; }
  .footer { padding: 14px 40px; background: #f8f9ff; border-top: 1px solid #e8ecf8; font-size: 10px; color: #9ca3af; text-align: center; }
</style>
</head>
<body>
<div class="letterhead">
  <div>
    <div class="company-name">${companyName}</div>
    <div class="company-details">
      ${companyAddress}<br>
      ${companyEmail} | ${companyWebsite}
    </div>
  </div>
  <div class="company-badge">
    <div class="msme">MSME REGISTERED</div>
    <div class="reg">Udyam Registration</div>
  </div>
</div>

<div class="body">
  <div class="date">Date: ${issueDate}</div>

  <div class="doc-title">INTERNSHIP OFFER LETTER</div>

  <div class="salutation">Dear <strong>${user.name}</strong>,</div>

  <p class="body-text">
    We are pleased to offer you an internship opportunity at <strong>${companyName}</strong>.
    After reviewing your application, we are delighted to welcome you to our team as an intern
    in the <strong>${batch.domain}</strong> domain.
  </p>

  <div class="highlight-box">
    <table>
      <tr><td>Intern Name</td><td>${user.name}</td></tr>
      <tr><td>Internship Domain</td><td>${batch.domain}</td></tr>
      <tr><td>Tech Stack</td><td>${batch.stack || "—"}</td></tr>
      <tr><td>Internship Role</td><td>${batch.internshipId?.title || batch.batchName}</td></tr>
      <tr><td>Duration</td><td>${batch.durationWeeks} Weeks</td></tr>
      <tr><td>Start Date</td><td>${startDate}</td></tr>
      <tr><td>End Date</td><td>${endDate}</td></tr>
      <tr><td>Mode</td><td>Online / Remote</td></tr>
      <tr><td>Stipend</td><td>${batch.stipend ? `₹${batch.stipend}/-` : "Unpaid / Performance Based"}</td></tr>
    </table>
  </div>

  <p class="body-text">
    During this internship, you will be working on real-world projects under the guidance of our
    experienced mentors. Weekly sessions will be conducted every Friday. You are expected to submit
    your weekly work through the provided links by the deadlines.
  </p>

  <p class="body-text">
    Upon successful completion of the program, you will receive an internship completion certificate
    from ${companyName} that can be verified at <strong>${companyWebsite}/verify</strong>.
  </p>

  <p class="body-text">
    We look forward to having you with us and wish you a rewarding internship experience.
  </p>

  <div class="signature-section">
    <div class="sig-box">
      <div class="sig-line">Authorized Signatory<br><strong>${companyName}</strong></div>
    </div>
    <div class="sig-box">
      <div class="sig-line">Intern Acceptance<br><strong>${user.name}</strong></div>
    </div>
  </div>
</div>

<div class="footer">
  ${companyName} | ${companyAddress} | ${companyEmail} | ${companyWebsite}
</div>
</body>
</html>`;
};

/**
 * Generate an Offer Letter PDF for an intern.
 */
const generateOfferLetterPdf = async (data) => {
  const { user, outputDir } = data;
  const html = generateOfferLetterHtml(data);

  const filename = `offer_letter_${user.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, filename);

  await generatePdfFromHtml(html, outputPath);
  return outputPath;
};

module.exports = { generateOfferLetterPdf, generateOfferLetterHtml };
