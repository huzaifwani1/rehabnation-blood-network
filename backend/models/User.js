const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Organization name or Admin name
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hospital', 'admin'], default: 'hospital' },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
  
  // Hospital specific details
  license_number: { type: String, required: function() { return this.role === 'hospital'; } },
  district: { type: String, required: true },
  address: { type: String, required: true },
  
  initials: { type: String },
  fcm_tokens: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
