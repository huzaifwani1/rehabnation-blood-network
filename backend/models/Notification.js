const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['blood_request', 'outcome_recorded', 'account_verified'], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  is_read: { type: Boolean, default: false },
  request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);
