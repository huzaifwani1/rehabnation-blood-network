const mongoose = require('mongoose');

const BloodRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  patient_name: { type: String, required: true },
  blood_type: { type: String, required: true },
  hospital_name: { type: String, required: true },
  district: { type: String, required: true },
  units_needed: { type: Number, required: true },
  units_fulfilled: { type: Number, default: 0 },
  urgency: { type: String, enum: ['critical', 'urgent', 'standard'], default: 'standard' },
  phone: { type: String, required: true },
  notes: { type: String },
  status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
  matching_donor_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BloodRequest', BloodRequestSchema);
