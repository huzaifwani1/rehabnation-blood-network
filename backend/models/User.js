const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
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
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  initials: { type: String },
  status: { type: String, enum: ['approved', 'suspended'], default: 'approved' },
  is_flagged: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
