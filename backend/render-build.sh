#!/usr/bin/env bash
# exit on error
set -o errexit

npm install

# Install Puppeteer browser for PDF generation
echo "Installing Puppeteer browser..."
npx puppeteer browsers install chrome

# If you have a build step (e.g. for a frontend or compiled backend):
# npm run build

# If you need to run seeds or migrations in production (uncomment if needed):
# npm run seed
