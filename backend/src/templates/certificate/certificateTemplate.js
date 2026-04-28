const path = require("path");
const fs = require("fs");
const { generatePdfFromHtml } = require("../../utils/pdfGenerator");

/**
 * Generate Certificate HTML.
 */
const generateCertificateHtml = (data) => {
  const { user, batch, certificate, internship } = data;

  const logoPath = path.join(__dirname, "logo.png");
  let logoBase64 = "";
  const dheerajSignPath = path.join(__dirname, "dheerajSignature.png");
  let dheerajSignBase64 = "";
  const pavanSignPath = path.join(__dirname, "pavanSignature.png");
  let pavanSignBase64 = "";
  const googlePath = path.join(__dirname, "google.png");
  let googleBase64 = "";
  const msmePath = path.join(__dirname, "msme.png");
  let msmeBase64 = "";
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Logo not found:", err);
  }
  try {
    const dheerajSignBuffer = fs.readFileSync(dheerajSignPath);
    dheerajSignBase64 = `data:image/png;base64,${dheerajSignBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Signature not found:", err);
  }
  try {
    const pavanSignBuffer = fs.readFileSync(pavanSignPath);
    pavanSignBase64 = `data:image/png;base64,${pavanSignBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Signature not found:", err);
  }
  try {
    const googleBuffer = fs.readFileSync(googlePath);
    googleBase64 = `data:image/png;base64,${googleBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Google not found:", err);
  }
  try {
    const msmeBuffer = fs.readFileSync(msmePath);
    msmeBase64 = `data:image/png;base64,${msmeBuffer.toString("base64")}`;
  } catch (err) {
    console.error("Msme not found:", err);
  }

  const companyName = process.env.COMPANY_NAME || "Ofzen Technologies";
  const companyAddress =
    process.env.COMPANY_ADDRESS || "Kakinada, Andhra Pradesh";
  const companyWebsite = process.env.COMPANY_WEBSITE || "www.ofzen.in";
  const companyEmail = "support@ofzen";
  const certVerifyBase =
    process.env.CERT_VERIFY_BASE_URL || "http://localhost:5173";
  const verifyUrl = `${certVerifyBase}/verify/${certificate.certificateId}`;

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

  return `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <style>
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
            justify-content: center;
            align-items: center;
        }

        .company-name {
            font-size: 28px;
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
            height: 50px;
            width: auto;
        }

        .company-details {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 13px;
            gap: 1px;
            color: #6b7280;
            margin-top: 4px;
            line-height: 1.5;
        }

        .body {
            padding: 10px 60px;
        }

        .doc-title {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a2e;
            text-align: center;
            margin-bottom: 24px;
        }

        .body-text {
            margin-bottom: 14px;
            font-size: 16px;
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
        bottom: 300px;
        left: 60px;
        right: 60px;
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
    }

    .sig-box {
        text-align: center;
    }

    .dSign-container {
      display: flex;
      align-items: center;
    }
    
    .dSign-container img {
      height: 70px;
      width: 150px;
    }

    .pSign-container {
      display: flex;
      align-items: center;
    }
    
    .pSign-container img {
      height: 50px;
      margin-bottom: 20px;
      width: 150px;
    }

    .sig-line {
      border-top: 1px solid #1a1a2e;
      padding-top: 6px;
      font-size: 12px;
      color: #374151;
    }

    .partner-container{
        position: absolute;
        bottom: 150px;
        left: 60px;
        right: 60px;
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
    }

    .partner-logo{
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .partner-logo .google{
        height: 80px;
        width: auto;
    }

    .partner-logo .msme{
        height: 100px;
        width: auto;
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
  <div class="watermark">
  <p>OFZEN</p>
  </div>
    <div class="container">
        <div class="letterhead">
            <div class="logo-container">
                ${logoBase64 ? `<img src="${logoBase64}" alt="Logo">` : ""}
            </div>
            <div class="company-name">${companyName}</div>
            <div class="company-details">
                <p>${companyAddress}</p>
                <p>${companyEmail} | ${companyWebsite}</p>
            </div>
        </div>

        <div class="body">

            <div class="doc-title">Certificate of Internship</div>

            <p class="body-text">
                This is to certify that <strong>${user.name}</strong> has done his internship as a
                <strong>${internship?.title || batch?.role}</strong> at
                <strong>${companyName}</strong> from <strong>${startDate}</strong> -
                <strong>${endDate}</strong>.
            </p>

            <p class="body-text">
                During the tenure of this internship, <strong>${user.name}</strong> demonstrated commendable dedication,
                professionalism, and enthusiasm. Actively contributed to real-world projects and
                working under the guidance of our experienced mentors.
            </p>

            <p class="body-text">
                They maintained a cooperative and respectful approach in their interactions, which made them a valued member 
                of the team. We appreciate the efforts and contributions they have made during their tenure with us.
            </p>

            <p class="body-text">
                We sincerely wish them every success in their future endeavors and are confident that they will continue to 
                grow and excel in their professional journey.
            </p>

            <div class="signature-section">
                <div class="sig-box">
                    <div class="dSign-container">
                        ${dheerajSignBase64 ? `<img src="${dheerajSignBase64}" alt="Signature">` : ""}
                    </div>
                    <div class="sig-line">
                        Dheeraj Bathi
                        <div class="sig-name">${companyName}</div>
                    </div>
                </div>
                
                <div class="sig-box">
                    <div class="pSign-container">
                        ${pavanSignBase64 ? `<img src="${pavanSignBase64}" alt="Signature">` : ""}
                    </div>
                    <div class="sig-line">
                        Pavan Gollapalli
                        <div class="sig-name">${companyName}</div>
                    </div>
                </div>
            </div>

            <div class="partner-container">
              <div class="partner-logo">
                  ${googleBase64 ? `<img class="google" src="${googleBase64}" alt="Logo">` : ""}
              </div>
              
              <div class="partner-logo">
                  ${msmeBase64 ? `<img class="msme" src="${msmeBase64}" alt="Logo">` : ""}
              </div>
            </div>
        </div>

        <div class="footer">
            ${companyName} | ${companyAddress} | ${companyEmail} | ${companyWebsite}
        </div>
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
  
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:5001';
  
  return {
    absolutePath: outputPath,
    fullUrl: `${baseUrl}/uploads/pdfs/${filename}`
  };
};

module.exports = { generateCertificatePdf, generateCertificateHtml };
