const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Hospital Name
  blood_bank_name: { type: String }, // Optional Blood Bank Name
  registration_number: { type: String, required: function() { return this.role === 'hospital'; } }, // Registration Number
  hospital_type: { type: String, required: function() { return this.role === 'hospital'; } }, // e.g. Private, Government, etc.
  contact_person: { type: String, required: function() { return this.role === 'hospital'; } }, // Contact Person
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['hospital', 'admin'], default: 'hospital' },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'pending' },
  
  address: { type: String, required: true },
  district: { type: String, required: true },
  state: { type: String, required: true },
  
  initials: { type: String },
  fcm_tokens: [{ type: String }],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
