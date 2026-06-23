const mongoose = require('mongoose');

const DonationHistorySchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true },
  donated_at: { type: Date, default: Date.now },
  units: { type: Number, default: 1 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DonationHistory', DonationHistorySchema);
