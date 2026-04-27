const asyncHandler = require('express-async-handler');
const MailConfig = require('../models/MailConfig');
const MailLog = require('../models/MailLog');
const { encrypt, decrypt } = require('../utils/encryption');
const { sendMail, testSmtpConnection } = require('../utils/mailer');
const { generateOfferLetterPdf } = require('../templates/offerLetter/offerLetterTemplate');
const { generateCertificatePdf } = require('../templates/certificate/certificateTemplate');
const { generatePayslipPdf } = require('../templates/payslip/payslipTemplate');
const Intern = require('../models/Intern');
const Payslip = require('../models/Payslip');
const Certificate = require('../models/Certificate');
const path = require('path');

const PDF_DIR = path.join(__dirname, '../../uploads/pdfs');

// ─── MAIL CONFIG ──────────────────────────────────────────────────────────────

// GET /api/mail-config
const getMailConfig = asyncHandler(async (req, res) => {
  const config = await MailConfig.findOne({ userId: req.user.id });
  if (!config) return res.json({ success: true, config: null });

  // Never send the encrypted password to frontend
  const safe = { ...config.toObject(), smtpPasswordEncrypted: undefined, hasPassword: true };
  res.json({ success: true, config: safe });
});

// POST /api/mail-config
const saveMailConfig = asyncHandler(async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, fromName } = req.body;
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    res.status(400);
    throw new Error('smtpHost, smtpPort, smtpUser, and smtpPassword are required');
  }

  const encrypted = encrypt(smtpPassword);

  const config = await MailConfig.findOneAndUpdate(
    { userId: req.user.id },
    { smtpHost, smtpPort, smtpUser, smtpPasswordEncrypted: encrypted, fromName, isActive: true },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: 'Mail config saved', configId: config._id });
});

// POST /api/mail-config/test
const testMailConfig = asyncHandler(async (req, res) => {
  const config = await MailConfig.findOne({ userId: req.user.id });
  if (!config) { res.status(404); throw new Error('No mail config found. Please set up SMTP first.'); }

  await testSmtpConnection(config, req.user.email);

  config.testedAt = new Date();
  await config.save();

  res.json({ success: true, message: 'Test email sent successfully' });
});

// ─── SEND MAILS ───────────────────────────────────────────────────────────────

// POST /api/mail/send-offer-letter
const sendOfferLetter = asyncHandler(async (req, res) => {
  const { internId } = req.body;
  const intern = await Intern.findById(internId)
    .populate('userId', 'name email')
    .populate('batchId');

  if (!intern) { res.status(404); throw new Error('Intern not found'); }

  // Generate PDF
  const pdfPath = await generateOfferLetterPdf({
    intern, user: intern.userId, batch: intern.batchId, outputDir: PDF_DIR,
  });

  const result = await sendMail({
    sentByUserId: req.user.id,
    toEmail: intern.userId.email,
    toName: intern.userId.name,
    subject: `Internship Offer Letter — ${intern.batchId.domain} | ${process.env.COMPANY_NAME}`,
    html: `<p>Dear ${intern.userId.name},</p><p>Please find your internship offer letter attached.</p><p>Best regards,<br>${process.env.COMPANY_NAME}</p>`,
    type: 'offer_letter',
    attachmentPath: pdfPath,
  });

  if (result.via !== 'manual') {
    intern.offerLetterSent = true;
    intern.offerLetterUrl = pdfPath.replace(path.join(__dirname, '../..'), '');
    await intern.save();
  }

  res.json({ success: true, ...result, pdfPath: pdfPath.replace(path.join(__dirname, '../..'), '') });
});

// POST /api/mail/send-payslip
const sendPayslip = asyncHandler(async (req, res) => {
  const { payslipId } = req.body;
  const payslip = await Payslip.findById(payslipId)
    .populate({ path: 'employeeId', populate: { path: 'userId', select: 'name email' } });

  if (!payslip) { res.status(404); throw new Error('Payslip not found'); }

  let pdfPath = payslip.pdfUrl ? path.join(__dirname, '../..', payslip.pdfUrl) : null;

  if (!pdfPath || !require('fs').existsSync(pdfPath)) {
    pdfPath = await generatePayslipPdf({
      employee: payslip.employeeId,
      payslip: payslip.toObject(),
      outputDir: PDF_DIR,
    });
  }

  const result = await sendMail({
    sentByUserId: req.user.id,
    toEmail: payslip.employeeId.userId.email,
    toName: payslip.employeeId.userId.name,
    subject: `Salary Slip — ${new Date(0, payslip.month - 1).toLocaleString('en', { month: 'long' })} ${payslip.year}`,
    html: `<p>Dear ${payslip.employeeId.userId.name},</p><p>Your salary slip is attached.</p>`,
    type: 'payslip',
    attachmentPath: pdfPath,
  });

  res.json({ success: true, ...result });
});

// POST /api/mail/send-custom
const sendCustomMail = asyncHandler(async (req, res) => {
  const { toEmail, toName, subject, body } = req.body;
  if (!toEmail || !subject || !body) {
    res.status(400);
    throw new Error('toEmail, subject, and body are required');
  }

  const result = await sendMail({
    sentByUserId: req.user.id,
    toEmail, toName, subject,
    html: body.replace(/\n/g, '<br>'),
    type: 'custom',
  });

  res.json({ success: true, ...result });
});

// GET /api/mail/logs
const getMailLogs = asyncHandler(async (req, res) => {
  const { type, status } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const logs = await MailLog.find(filter)
    .populate('sentBy', 'name email')
    .sort({ sentAt: -1 })
    .limit(100);

  res.json({ success: true, logs });
});

module.exports = { getMailConfig, saveMailConfig, testMailConfig, sendOfferLetter, sendPayslip, sendCustomMail, getMailLogs };
