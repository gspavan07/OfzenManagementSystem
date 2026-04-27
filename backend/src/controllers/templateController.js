const { generatePdfBuffer } = require('../utils/pdfGenerator');
const { generatePayslipHtml } = require('../templates/payslip/payslipTemplate');
const { generateCertificateHtml } = require('../templates/certificate/certificateTemplate');
const { generateOfferLetterHtml } = require('../templates/offerLetter/offerLetterTemplate');

// Dummy data for previews
const DUMMY_DATA = {
  payslip: {
    employee: {
      userId: { name: 'John Doe' },
      employeeCode: 'EMP001',
      designation: 'Software Engineer',
      department: 'Engineering',
    },
    payslip: {
      month: 10,
      year: 2023,
      status: 'paid',
      workingDays: 22,
      presentDays: 21,
      earnings: {
        basic: 50000,
        hra: 20000,
        travelAllowance: 5000,
        medicalAllowance: 2000,
        otherAllowance: 3000,
        grossEarnings: 80000,
      },
      deductions: {
        pf: 1800,
        esi: 500,
        tds: 5000,
        pt: 200,
        lwf: 50,
        loanRecovery: 0,
        otherDeductions: 0,
        totalDeductions: 7550,
      },
      netPay: 72450,
      employerContributions: {
        pf: 1800,
        esi: 2600,
      }
    }
  },
  certificate: {
    user: { name: 'Jane Smith' },
    batch: {
      domain: 'Full Stack Development',
      batchName: 'Batch 2023-A',
      durationWeeks: 12,
    },
    certificate: {
      certificateId: 'CERT-12345-67890',
      issueDate: new Date(),
    }
  },
  offerLetter: {
    user: { name: 'Alice Johnson' },
    batch: {
      domain: 'Frontend Development',
      batchName: 'Frontend Internship Oct-2023',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months later
      durationWeeks: 12,
      stipend: 5000,
      internshipId: { title: 'Junior Web Intern' }
    }
  }
};

/**
 * Preview or Download a document template with dummy data.
 * GET /api/templates/preview/:templateType?download=true
 */
const previewTemplate = async (req, res) => {
  const { templateType } = req.params;
  const isDownload = req.query.download === 'true';

  try {
    let html;
    let filename;

    let dataKey = templateType;
    if (templateType === 'offer-letter') dataKey = 'offerLetter';

    const data = DUMMY_DATA[dataKey];
    if (!data) {
        return res.status(400).json({ message: 'Invalid template type' });
    }

    switch (templateType) {
      case 'payslip':
        html = generatePayslipHtml(data);
        filename = `payslip_template_preview.pdf`;
        break;
      case 'certificate':
        html = generateCertificateHtml(data);
        filename = `certificate_template_preview.pdf`;
        break;
      case 'offer-letter':
        html = generateOfferLetterHtml(data);
        filename = `offer_letter_template_preview.pdf`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid template type' });
    }

    const buffer = await generatePdfBuffer(html);

    // Set headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `${isDownload ? 'attachment' : 'inline'}; filename="${filename}"`
    );

    res.send(buffer);

  } catch (error) {
    console.error('Template preview error:', error);
    res.status(500).json({ message: 'Failed to generate preview', error: error.message });
  }
};

module.exports = {
  previewTemplate,
};
