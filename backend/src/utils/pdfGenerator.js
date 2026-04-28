const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

/**
 * Generate a PDF from an HTML string using Puppeteer.
 * @param {string} html - Full HTML document string
 * @param {string} outputPath - Absolute file path to save the PDF
 * @returns {string} outputPath
 */
const generatePdfFromHtml = async (html, outputPath) => {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
  } finally {
    await browser.close();
  }

  return outputPath;
};

/**
 * Generate a PDF buffer from an HTML string using Puppeteer.
 * @param {string} html - Full HTML document string
 * @returns {Buffer} PDF Buffer
 */
const generatePdfBuffer = async (html) => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });
    return buffer;
  } finally {
    await browser.close();
  }
};

module.exports = { generatePdfFromHtml, generatePdfBuffer };
