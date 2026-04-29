const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  contactNumber: { type: String, required: true },
  budget: { type: Number, required: true },
  preferredArea: { type: String, required: true },
  sharingType: { type: String, enum: ['Single', 'Shared'], required: true },
  gender: { type: String, enum: ['Boys', 'Girls', 'Co-ed'], required: true },
  consentToPublish: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
