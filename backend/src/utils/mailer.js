const nodemailer = require('nodemailer');
const MailConfig = require('../models/MailConfig');
const MailLog = require('../models/MailLog');
const { decrypt } = require('./encryption');

/**
 * Send an email using the sender's configured SMTP credentials.
 * Falls back to "manual" mode if no config is found.
 *
 * @param {object} options
 * @param {string} options.sentByUserId  - User sending the mail
 * @param {string} options.toEmail
 * @param {string} options.toName
 * @param {string} options.subject
 * @param {string} options.html          - HTML body
 * @param {string} options.type          - 'offer_letter' | 'certificate' | 'payslip' | 'custom'
 * @param {string} [options.attachmentPath] - Absolute path to PDF attachment
 * @returns {object} { success, via, logId }
 */
const sendMail = async (options) => {
  const { sentByUserId, toEmail, toName, subject, html, type, attachmentPath } = options;

  // ── Try to load SMTP config ────────────────────────────────────────────────
  const config = await MailConfig.findOne({ userId: sentByUserId, isActive: true });

  const logBase = {
    type,
    toEmail,
    toName,
    subject,
    sentBy: sentByUserId,
    attachmentUrl: attachmentPath || null,
  };

  if (!config) {
    // Manual fallback — no SMTP configured
    const log = await MailLog.create({
      ...logBase,
      sentVia: 'manual',
      status: 'manual_pending',
    });
    return { success: false, via: 'manual', logId: log._id };
  }

  // ── Decrypt password and send via SMTP ─────────────────────────────────────
  try {
    const smtpPassword = decrypt(config.smtpPasswordEncrypted);

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser,
        pass: smtpPassword,
      },
    });

    const mailOptions = {
      from: `"${config.fromName || 'Ofzen Technologies'}" <${config.smtpUser}>`,
      to: `"${toName || toEmail}" <${toEmail}>`,
      subject,
      html,
    };

    if (attachmentPath) {
      mailOptions.attachments = [
        {
          filename: attachmentPath.split('/').pop(),
          path: attachmentPath,
        },
      ];
    }

    await transporter.sendMail(mailOptions);

    const log = await MailLog.create({
      ...logBase,
      sentVia: 'smtp',
      status: 'sent',
      sentAt: new Date(),
    });

    return { success: true, via: 'smtp', logId: log._id };
  } catch (err) {
    const log = await MailLog.create({
      ...logBase,
      sentVia: 'smtp',
      status: 'failed',
      errorMessage: err.message,
    });

    return { success: false, via: 'smtp', error: err.message, logId: log._id };
  }
};

/**
 * Test SMTP connection by sending a test mail to the config owner.
 */
const testSmtpConnection = async (configData, testEmail) => {
  const smtpPassword = decrypt(configData.smtpPasswordEncrypted);

  const transporter = nodemailer.createTransport({
    host: configData.smtpHost,
    port: configData.smtpPort,
    secure: configData.smtpPort === 465,
    auth: {
      user: configData.smtpUser,
      pass: smtpPassword,
    },
  });

  await transporter.sendMail({
    from: `"${configData.fromName}" <${configData.smtpUser}>`,
    to: testEmail,
    subject: 'Ofzen Mail Config — Test Connection ✅',
    html: '<p>Your SMTP configuration is working correctly.</p>',
  });

  return true;
};

module.exports = { sendMail, testSmtpConnection };
