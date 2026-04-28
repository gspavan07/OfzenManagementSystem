const { join } = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer to a local directory
  // This ensures it persists between build and runtime on Render
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
