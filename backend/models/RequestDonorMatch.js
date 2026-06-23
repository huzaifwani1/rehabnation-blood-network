const mongoose = require('mongoose');

const RequestDonorMatchSchema = new mongoose.Schema({
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  response: { type: String, enum: ['pending', 'available', 'unavailable'], default: 'pending' },
  outcome: { type: String, enum: ['pending', 'donated', 'no_show', 'cancelled'], default: 'pending' },
  responded_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RequestDonorMatch', RequestDonorMatchSchema);
