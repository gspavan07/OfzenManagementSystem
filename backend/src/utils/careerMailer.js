const nodemailer = require("nodemailer");

/**
 * Send a professional registration success email to the student.
 * Uses credentials from .env
 */
const sendRegistrationSuccessEmail = async (studentData) => {
  const { name, email, refNumber, batchName, paymentId, domain } = studentData;

  // 1. Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.CAREERS_MAIL_HOST || "smtp.zoho.in",
    port: parseInt(process.env.CAREERS_MAIL_PORT) || 465,
    secure: true, // Zoho SSL
    auth: {
      user: process.env.CAREERS_MAIL_USER || "careers@ofzen.in",
      pass: process.env.CAREERS_MAIL_PASS,
    },
  });

  // 2. Email HTML Template
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px; border-radius: 10px;">
      <div style="background-color: #0f172a; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">OFZEN TECHNOLOGIES</h1>
        <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Careers & Internship Portal</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 20px;">Registration Successful! ✅</h2>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">Dear <strong>${name}</strong>,</p>
        
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Congratulations! We have successfully received your internship registration for the <strong>${batchName}</strong> (${domain}).
        </p>

        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #111827; margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Application Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">Ref Number:</td>
              <td style="color: #111827; font-size: 14px; font-weight: bold; padding: 5px 0; text-align: right;">${refNumber}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">Payment ID:</td>
              <td style="color: #111827; font-size: 14px; font-weight: bold; padding: 5px 0; text-align: right;">${paymentId}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-size: 14px; padding: 5px 0;">Status:</td>
              <td style="color: #059669; font-size: 14px; font-weight: bold; padding: 5px 0; text-align: right;">Paid & Pending Approval</td>
            </tr>
          </table>
        </div>

        <h3 style="color: #111827; font-size: 16px; margin: 25px 0 15px 0;">What happens next?</h3>
        <ul style="color: #4b5563; font-size: 14px; line-height: 1.8; padding-left: 20px;">
          <li>Our HR team will verify your details and payment.</li>
          <li>You will receive your <strong>Offer Letter</strong> via email within 24-48 hours.</li>
          <li>Once approved, your login credentials for the Student Portal will be sent in a separate email.</li>
        </ul>

        <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
          If you have any questions, feel free to contact us at <a href="mailto:careers@ofzen.in" style="color: #2563eb; text-decoration: none;">careers@ofzen.in</a>.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">
            This is an automated confirmation of your internship registration.<br>
            Ofzen Technologies, Kakinada, AP.
          </p>
        </div>
      </div>
    </div>
  `;

  // 3. Send email
  await transporter.sendMail({
    from: `"Ofzen Careers" <${process.env.CAREERS_MAIL_USER || "careers@ofzen.in"}>`,
    to: email,
    subject: `Internship Registration Successful — ${refNumber}`,
    html,
  });
};

/**
 * Send approval emails (Offer Letter and Login Details)
 */
const sendApprovalEmails = async (data) => {
  const { name, email, offerLetterPath, batchName, domain } = data;

  const transporter = nodemailer.createTransport({
    host: process.env.CAREERS_MAIL_HOST || "smtp.zoho.in",
    port: parseInt(process.env.CAREERS_MAIL_PORT) || 465,
    secure: true,
    auth: {
      user: process.env.CAREERS_MAIL_USER || "careers@ofzen.in",
      pass: process.env.CAREERS_MAIL_PASS,
    },
  });

  // 1. Send Offer Letter Email
  await transporter.sendMail({
    from: `"Ofzen Careers" <${process.env.CAREERS_MAIL_USER || "careers@ofzen.in"}>`,
    to: email,
    subject: `Internship Onboarding Confirmation – Welcome to Ofzen!`,
    html: `
      <div style="font-family: sans-serif; color: #333; line-height: 1.6;">
        <h2>Congratulations ${name}!</h2>
        <p>We are pleased to inform you that your internship application for <strong>${batchName}</strong> (${domain}) has been <strong>approved</strong>.</p>
        <p>Please find your official <strong>Internship Offer Letter</strong> attached to this email.</p>
        <p>We are excited to have you on board!</p>
        <br>
        <p>Best Regards,<br>Team Ofzen</p>
      </div>
    `,
    attachments: [
      {
        filename: `Offer_Letter_${name.replace(/\s+/g, "_")}.pdf`,
        path: offerLetterPath,
      },
    ],
  });

  // 2. Send Login Details Email
  const loginUrl = process.env.FRONTEND_URL || "https://work.ofzen.in";
  await transporter.sendMail({
    from: `"Ofzen Support" <${process.env.CAREERS_MAIL_USER || "careers@ofzen.in"}>`,
    to: email,
    subject: `Welcome to Ofzen — Student Portal Access`,
    html: `
      <body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f8; padding:20px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5; color:#ffffff; padding:20px; text-align:center;">
              <h2 style="margin:0;">Welcome to Ofzen Technologies 🎉</h2>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333; font-size:15px; line-height:1.6;">
              
              <p>Dear <strong>${name}</strong>,</p>

              <p>Congratulations!</p>

              <p>
                We are delighted to inform you that your application for the 
                <strong>${batchName} (${domain}) internship program</strong> has been successfully approved.
              </p>

              <p>
                Please find your official <strong>Internship Offer Letter</strong> attached to this email. 
                Kindly review the document carefully and follow any instructions mentioned within.
              </p>

              <p>
                We are excited to have you on board and look forward to your contributions. 
                This internship will provide you with valuable hands-on experience and learning opportunities.
              </p>

              <p>
                If you have any questions or need assistance, feel free to reach out to us.
              </p>

              <br>

              <p>
                Warm regards,<br>
                <strong>Team Ofzen</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f5f9; padding:15px; text-align:center; font-size:12px; color:#666;">
              © 2026 Ofzen Technologies. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
    `,
  });
};

module.exports = { sendRegistrationSuccessEmail, sendApprovalEmails };
