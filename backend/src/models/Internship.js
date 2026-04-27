const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true }, // e.g., FSD - Intern
  domain: { 
    type: String, 
    required: true, 
    enum: ['Full Stack', 'Frontend', 'UI/UX', 'AI + Full Stack'] 
  },
  description: { type: String, trim: true },
  openings: { type: Number, default: 0 }, // Indicative openings for display
  status: { 
    type: String, 
    enum: ['active', 'closed'], 
    default: 'active' 
  },
  fee: { type: Number, required: true, default: 899 } // Global fee for this internship role
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
