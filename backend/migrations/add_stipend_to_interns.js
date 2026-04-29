const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../src/config/db');
const Intern = require('../src/models/Intern');

const migrate = async () => {
  try {
    await connectDB();
    console.log('Starting migration: Adding stipend field to all interns...');

    const result = await Intern.updateMany(
      { stipend: { $exists: false } },
      { $set: { stipend: 0 } }
    );

    console.log(`Migration completed successfully!`);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
