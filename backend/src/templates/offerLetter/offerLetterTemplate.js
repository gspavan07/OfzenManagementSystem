const path = require("path");
const fs = require("fs");
const { generatePdfFromHtml } = require("../../utils/pdfGenerator");

/**
 * Generate Offer Letter HTML.
 */
const generateOfferLetterHtml = (data) => {
  const { intern } = data;

  const logoPath = path.join(__dirname, "logo.png");
  let logoBase64 = "";
  const signPath = path.join(__dirname, "dheerajSignature.png");
  let signBase64 = "";
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Logo not found:", err);
  }
  try {
    const signBuffer = fs.readFileSync(signPath);
    signBase64 = `data:image/png;base64,${signBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Signature not found:", err);
  }

  const companyName = process.env.COMPANY_NAME || "Ofzen Technologies";
  const companyAddress =
    process.env.COMPANY_ADDRESS || "Kakinada, Andhra Pradesh";
  const companyWebsite = process.env.COMPANY_WEBSITE || "www.ofzen.in";
  const companyEmail = "careers@ofzen.in";

  const issueDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startDate = new Date(intern.batchId?.startDate).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );
  const endDate = new Date(intern.batchId?.endDate).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  );

  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', sans-serif;
      font-size: 13.5px;
      color: #1a1a2e;
      background: #fff;
      line-height: 1.7;
    }

    .letterhead {
      padding: 50px;
      padding-bottom: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .company-name {
      font-size: 22px;
      font-weight: 800;
      color: #2563eb;
      letter-spacing: -0.5px;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-container img {
      height: 35px;
      width: auto;
    }

    .company-details {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
      line-height: 1.5;
    }

    .company-badge {
      background: #f0f0ff;
      border: 1.5px solid #2563eb;
      border-radius: 6px;
      padding: 8px 14px;
      text-align: right;
    }

    .company-badge .msme {
      font-size: 10px;
      color: #2563eb;
      font-weight: 700;
    }

    .company-badge .reg {
      font-size: 9px;
      color: #9ca3af;
      margin-top: 2px;
    }

    .body {
      padding: 30px 50px;
    }

    .date {
    text-align: right;
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 24px;
    }

    .doc-title {
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      text-align: center;
      margin-bottom: 24px;
    }

    .salutation {
      margin-bottom: 16px;
    }

    .body-text {
      margin-bottom: 14px;
      text-align: justify;
    }

    .highlight-box {
      background: #f0f0ff;
      border-left: 4px solid #2563eb;
      padding: 14px 18px;
      border-radius: 0 6px 6px 0;
      margin: 20px 0;
    }

    .highlight-box table {
      width: 100%;
    }

    .highlight-box td {
      padding: 5px 0;
    }

    .highlight-box td:first-child {
      font-weight: 600;
      color: #4f46e5;
      width: 180px;
    }

    .signature-section {
        position: absolute;
        bottom: 250px;
        left: 50px;
        right: 50px;
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
    }

    .sig-box {
        text-align: center;
    }

    .sign-container {
      display: flex;
      align-items: center;
    }
    
    .sign-container img {
      height: 90px;
      width: auto;
    }
    .sig-line {
      border-top: 1px solid #1a1a2e;
      padding-top: 6px;
      font-size: 12px;
      color: #374151;
    }

    .footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 14px 40px;
      background: #f8f9ff;
      border-top: 1px solid #e8ecf8;
      font-size: 10px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
<div class="letterhead">
  <div>
    <div class="logo-container">
      ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : ""}
      <div class="company-name">${companyName}</div>
    </div>
    <div class="company-details">

      ${companyAddress}<br>
      ${companyEmail} | ${companyWebsite}
    </div>
  </div>
  
</div>

<div class="body">

            <div class="doc-title">Internship Offer Letter</div>
            <div class="date">Date: ${issueDate}</div>

            <div class="salutation">Dear <strong>${intern.userId?.name}</strong>,</div>

            <p class="body-text">
                <strong>Congratulations from Ofzen Technologies.</strong>
            </p>

            <p class="body-text">
                We are pleased to extend this offer of an internship opportunity at <strong>${companyName}</strong>. 
                Following a thorough review of your application, we are delighted to welcome you to our 
                team as an <strong>${intern?.batchId?.internshipId?.title}</strong>.
            </p>
            <p class="body-text">
                The internship program will commence on <strong>${startDate}</strong> and conclude on <strong>${endDate}</strong>,
                 spanning a duration of <strong>${intern?.batchId?.internshipId?.durationWeeks} weeks</strong>, and will be conducted in <strong>Hybrid Mode</strong>.

            </p>
            <p class="body-text">
                Throughout this internship, you will have the opportunity to contribute to real-world 
                projects under the mentorship and guidance of our experienced professionals. You will be immersed 
                in a dynamic startup culture and environment one that encourages innovation and collaborative 
                problem-solving. This hands-on experience is designed to provide you with meaningful industry exposure and 
                practical skill development within a fast-paced, entrepreneurial setting. 
            </p>

            <p class="body-text">
                Upon successful completion of the program, you will receive an internship completion certificate from ${companyName}.
            </p>

            <p class="body-text">
                We look forward to having you with us and wish you a rewarding internship experience.
            </p>

            <div class="signature-section">
                <div class="sig-box">
                    <div class="sign-container">
                        ${signBase64 ? `<img src="${signBase64}" alt="Signature">` : ""}
                    </div>
                    <div class="sig-line">
                        Authorized Signatory
                        <div class="sig-name">${companyName}</div>
                    </div>
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
  const { intern, outputDir } = data;
  const html = generateOfferLetterHtml(data);

  const filename = `offer_letter_${intern.userId?.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  const outputPath = path.join(outputDir, filename);

  await generatePdfFromHtml(html, outputPath);

  const baseUrl = process.env.API_BASE_URL || "http://localhost:5001";

  // Return both absolute path (for email) and full web URL (for database/dashboard)
  return {
    absolutePath: outputPath,
    fullUrl: `${baseUrl}/uploads/pdfs/offer_letters/${filename}`,
  };
};

module.exports = { generateOfferLetterPdf, generateOfferLetterHtml };
