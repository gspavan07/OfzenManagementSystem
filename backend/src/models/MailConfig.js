const mongoose = require('mongoose');

const mailConfigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one config per user
    },
    smtpHost: { type: String, required: true, trim: true },
    smtpPort: { type: Number, required: true, default: 587 },
    smtpUser: { type: String, required: true, trim: true },
    // Password stored AES-256 encrypted
    smtpPasswordEncrypted: { type: String, required: true },
    fromName: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    testedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('MailConfig', mailConfigSchema);
