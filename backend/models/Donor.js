const mongoose = require('mongoose');

const DonorSchema = new mongoose.Schema({
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  full_name: { type: String, required: true },
  dob: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  phone: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  blood_type: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String },
  weight_kg: { type: Number },
  hemoglobin_level: { type: Number },
  last_donation_date: { type: String, default: '' },
  donation_count: { type: Number, default: 0 },
  verification_status: { type: String, enum: ['unverified', 'camp_verified'], default: 'unverified' },
  is_available: { type: Boolean, default: true },
  is_flagged: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donor', DonorSchema);
