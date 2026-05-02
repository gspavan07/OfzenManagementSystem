const path = require("path");
const fs = require("fs");
const { generatePdfFromHtml } = require("../../utils/pdfGenerator");

/**
 * Generate Certificate HTML.
 */
const generateCertificateHtml = (data) => {
  const { intern, certificate } = data;

  const logoPath = path.join(__dirname, "logo.png");
  let logoBase64 = "";
  const logoLightPath = path.join(__dirname, "logo_light.png");
  let logoLightBase64 = "";
  const dheerajSignPath = path.join(__dirname, "dheerajSignature.png");
  let dheerajSignBase64 = "";
  const pavanSignPath = path.join(__dirname, "pavanSignature.png");
  let pavanSignBase64 = "";
  const stampPath = path.join(__dirname, "stamp.png");
  let stampBase64 = "";
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Logo not found:", err);
  }
  try {
    const logoLightBuffer = fs.readFileSync(logoLightPath);
    logoLightBase64 = `data:image/png;base64,${logoLightBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Logo light not found:", err);
  }
  try {
    const stampBuffer = fs.readFileSync(stampPath);
    stampBase64 = `data:image/png;base64,${stampBuffer.toString("base64")}`;
  } catch (err) {
    console.error("stamp not found:", err);
  }
  try {
    const pavanSignBuffer = fs.readFileSync(pavanSignPath);
    pavanSignBase64 = `data:image/png;base64,${pavanSignBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Signature not found:", err);
  }
  try {
    const dheerajSignBuffer = fs.readFileSync(dheerajSignPath);
    dheerajSignBase64 = `data:image/png;base64,${dheerajSignBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Signature not found:", err);
  }

  const companyName = process.env.COMPANY_NAME || "Ofzen Technologies";
  const companyAddress =
    process.env.COMPANY_ADDRESS || "Kakinada, Andhra Pradesh";
  const companyWebsite = process.env.COMPANY_WEBSITE || "www.ofzen.in";
  const companyEmail = "support@ofzen";
  const certVerifyBase =
    process.env.CERT_VERIFY_BASE_URL || "http://localhost:5173";
  const verifyUrl = `${certVerifyBase}/verify/${certificate.certificateId}`;

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

  return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }



        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: -1;
            color: #2563eb;
            font-size: 180px;
            font-weight: 700;
            opacity: 0.1;
            pointer-events: none;
            user-select: none;
        }

        .top-bar {
            background: #2563eb;
            height: 6px;
            width: 100%;
        }

        body {
            font-family: 'Inter', sans-serif;
            font-size: 14px;
            color: #1a1a2e;
            background: #fff;
            line-height: 1.7;
        }

        .letterhead {
            padding: 50px 50px 20px 50px;
            display: flex;
            flex-direction: column;
            justify-content: left;
            align-items: left;
            border-bottom: 1px solid #E2E8F0;
        }

        .company-name {
            font-size: 28px;
            font-weight: 800;
            color: #2563eb;
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .logo-container img {
            height: 50px;
            width: auto;
        }

        .company-details {
            display: flex;
            flex-direction: column;
            align-items: left;
            font-size: 12px;
            gap: 1px;
            color: #6b7280;
            margin-top: 4px;
            line-height: 1.5;
        }

        .body {
            padding: 10px 50px;
        }

        .section-label {
            font-size: 10px;
            letter-spacing: 2.5px;
            text-transform: uppercase;
            color: #7b818a;
        }

        .cert-heading {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 38px;
            font-weight: 600;
            color: #0F172A;
            margin-bottom: 3px;
        }

        .rule {
            width: 48px;
            height: 3px;
            background: #2563eb;
            border-radius: 2px;
            margin-bottom: 12px;
        }

        .certify-text {
            font-size: 13px;
            color: #64748B;
            margin-bottom: 10px;
            font-weight: 400;
        }

        .recipient-name {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 34px;
            font-style: italic;
            color: #2563eb;
            font-weight: 400;
            margin-bottom: 14px;
            line-height: 1.2;
        }

        .role-text {
            font-size: 13px;
            color: #64748B;
            margin-bottom: 3px;
        }

        .role-name {
            font-size: 18px;
            font-weight: 500;
            color: #0F172A;
            margin-bottom: 1px;
        }

        .company-at {
            font-size: 13px;
            color: #64748B;
            margin-bottom: 2px;
        }

        .company-name2 {
            font-size: 16px;
            font-weight: 500;
            color: #2563eb;
            margin-bottom: 14px;
        }

        .meta-row {
            display: flex;
            gap: 48px;
            margin-bottom: 20px;
        }

        .meta-item {}

        .meta-item-label {
            font-size: 10px;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #94A3B8;
            margin-bottom: 3px;
        }

        .meta-item-value {
            font-size: 13px;
            font-weight: 500;
            color: #334155;
        }

        .meta-item-value.blue {
            color: #2563eb;
        }

        .divider {
            width: 100%;
            height: 1px;
            background: #E2E8F0;
            margin-bottom: 32px;
        }

        .body-para {
            font-size: 13.5px;
            line-height: 1.9;
            color: #475569;
            margin-bottom: 16px;
            font-weight: 400;
            text-align: justify;
        }

        .closing-text {
            font-size: 13.5px;
            line-height: 1.9;
            color: #475569;
            font-style: italic;
            margin-bottom: 0;
            text-align: justify;
        }

        .spacer {
            flex: 1;
        }

        .sig-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 70px;
        }

        .sig-block {}

        .pSign-container {
            display: flex;
            align-items: center;
        }

        .dSign-container img {
            height: 20px;
            margin-bottom: 20px;
            width: 160px;
        }
        .pSign-container img {
            height: 50px;
            margin-bottom: 20px;
            width: 150px;
        }

        .sig-underline {
            width: 160px;
            height: 1px;
            background: #CBD5E1;
            margin-bottom: 6px;
        }

        .sig-label {
            font-size: 11px;
            color: #64748B;
        }

        .sig-company {
            font-size: 11px;
            color: #94A3B8;
            margin-top: 2px;
        }

        .cert-id-block-top {
            position: absolute;
            top: 60px;
            right: 50px;
            text-align: right;
        }

        .cert-id-block-bottom {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
        }

        .cert-id-label {
            font-size: 10px;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #94A3B8;
            margin-bottom: 3px;
        }

        .cert-id-val {
            font-size: 12px;
            color: #64748B;
            font-family: monospace;
        }

        .verify {
            font-size: 10px;
            color: #94A3B8;
            margin-top: 4px;
        }

        .stamp-container {
            position: absolute;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: -1;
        }

        .stamp-logo img {
            height: 150px;
            width: auto;
            filter: grayscale(1);
        }

        .bottom-bar {
            height: 4px;
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(90deg, #2563eb 60%, #BFDBFE 100%);
        }
    </style>
</head>

<body>
    <div class="top-bar"></div>
    <div class="watermark">
        ${logoLightBase64 ? `<img src="${logoLightBase64}" alt="Logo Light">` : ""}
    </div>
    <div class="container">
        <div class="letterhead">
            <div class="logo-container">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : ""}
            </div>
            <div class="company-name">${companyName}</div>
            <div class="company-details">
                <p>${companyEmail} | ${companyWebsite}</p>
            </div>
            <div class="cert-id-block-top">
                <div class="cert-id-label">Certificate ID</div>
                <div class="cert-id-val">${certificate.certificateId}</div>
            </div>
        </div>

        <div class="body">
            <div class="section-label">Certificate of Recognition</div>
            <div class="cert-heading">Internship Completion</div>
            <div class="rule"></div>

            <div class="certify-text">This is to certify that</div>
            <div class="recipient-name">${intern.userId?.name}</div>
            <div class="role-text">has successfully completed their internship as a</div>
            <div class="role-name">${intern.internshipId?.title}</div>
            <div class="company-at">at</div>
            <div class="company-name2">${companyName}</div>

            <div class="meta-row">
                <div class="meta-item">
                    <div class="meta-item-label">Work Mode</div>
                    <div class="meta-item-value blue">${intern.workMode}</div>
                </div>
                <div class="meta-item">
                    <div class="meta-item-label">Duration</div>
                    <div class="meta-item-value">${startDate} – ${endDate}</div>
                </div>
            </div>

            <div class="divider"></div>

            <p class="body-para">
                During their tenure, ${intern.userId?.name} demonstrated commendable dedication, professionalism, and enthusiasm.
                They
                actively contributed to real-world projects, working under the guidance of our experienced mentors and
                consistently delivering quality output throughout the internship period.
            </p>

            <p class="body-para">
                They maintained a cooperative and respectful approach in all interactions, which made them a valued
                member of the
                team. We appreciate the efforts and contributions they have made during their time with us.
            </p>

            <p class="closing-text">
                We sincerely wish ${intern.userId?.name} every success in their future endeavors, and are confident that they will
                continue to
                grow and excel in their professional journey.
            </p>

            <div class="spacer"></div>

            <div class="sig-section">
                <div class="sig-block">
                    <div class="pSign-container">
                        ${dheerajSignBase64 ? `<img src="${dheerajSignBase64}" alt="Signature">` : ""}
                    </div>
                    <div class="sig-underline"></div>
                    <div class="sig-label">Dheeraj Bathi</div>
                    <div class="sig-company">${companyName}</div>
                    <div class="sig-company">${companyAddress}</div>
                </div>
                <div class="sig-block">
                    <div class="pSign-container">
                        ${pavanSignBase64 ? `<img src="${pavanSignBase64}" alt="Signature">` : ""}
                    </div>
                    <div class="sig-underline"></div>
                    <div class="sig-label">Pavan Gollapalli</div>
                    <div class="sig-company">${companyName}</div>
                    <div class="sig-company">${companyAddress}</div>
                </div>

                
            </div>
            <div class="cert-id-block-bottom">
                    
                    <div class="verify">Verify at ${verifyUrl}</div>
                </div>
        </div>

        <div class="stamp-container">
            <div class="stamp-logo">
                ${stampBase64 ? `<img class="stamp" src="${stampBase64}" alt="Stamp">` : ""}
            </div>
        </div>

        <div class="bottom-bar"></div>
    </div>
</body>

</html>
  `;
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

  const baseUrl = process.env.API_BASE_URL || "http://localhost:5001";

  return {
    absolutePath: outputPath,
    fullUrl: `${baseUrl}/uploads/pdfs/${filename}`,
  };
};

module.exports = { generateCertificatePdf, generateCertificateHtml };
