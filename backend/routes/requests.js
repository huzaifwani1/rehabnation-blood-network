const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const RequestDonorMatch = require('../models/RequestDonorMatch');
const Notification = require('../models/Notification');
const DonationHistory = require('../models/DonationHistory');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Blood type compatibility rules (Who can donate to whom)
const RECIPIENT_COMPATIBILITY = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
};

// Helper: Check donation eligibility based on 56-day rule
const isEligibleToDonate = (lastDonationDate) => {
  if (!lastDonationDate) return true;
  const diffTime = Math.abs(new Date() - new Date(lastDonationDate));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 56;
};

// POST /api/requests (Create request & match donors)
router.post('/', authenticateJWT, async (req, res) => {
  const { patient_name, blood_type, hospital_name, district, units_needed, urgency, phone, notes } = req.body;

  try {
    if (!patient_name || !blood_type || !hospital_name || !district || !units_needed || !phone) {
      return res.status(400).json({ error: 'Missing required request fields' });
    }

    // 1. Find compatible donors
    const compatibleGroups = RECIPIENT_COMPATIBILITY[blood_type] || [blood_type];
    
    const potentialDonors = await User.find({
      role: 'user',
      status: 'approved',
      is_flagged: false,
      is_available: true,
      blood_type: { $in: compatibleGroups },
      district: district
    });

    const activeDonors = potentialDonors.filter(donor => {
      // Exclude the requester themselves
      if (donor._id.toString() === req.user.id) return false;

      const weight = parseFloat(donor.weight_kg) || 0;
      const hb = parseFloat(donor.hemoglobin_level) || 0;
      const isWeightEligible = weight >= 50;
      const isHbEligible = hb >= 12.5;
      const isCooldownEligible = isEligibleToDonate(donor.last_donation_date);

      return isWeightEligible && isHbEligible && isCooldownEligible;
    });

    // 2. Create the BloodRequest
    const newRequest = new BloodRequest({
      requester: req.user.id,
      patient_name,
      blood_type,
      hospital_name,
      district,
      units_needed: Number(units_needed),
      urgency,
      phone,
      notes,
      matching_donor_count: activeDonors.length
    });

    await newRequest.save();

    // 3. Create matches & notifications
    const matchPromises = activeDonors.map(async (donor) => {
      const match = new RequestDonorMatch({
        request: newRequest._id,
        donor: donor._id,
        response: 'pending',
        outcome: 'pending'
      });
      await match.save();

      const notif = new Notification({
        recipient: donor._id,
        type: 'blood_request',
        title: `🚨 Emergency: ${blood_type} Needed`,
        body: `${hospital_name} has requested compatible blood. Respond availability immediately.`,
        request_id: newRequest._id
      });
      await notif.save();
    });

    await Promise.all(matchPromises);

    return res.status(201).json({
      success: true,
      request: newRequest,
      matched_count: activeDonors.length
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/requests (List all requests)
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const requests = await BloodRequest.find({}).populate('requester', 'name').sort({ created_at: -1 });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/requests/:id (Fetch detailed match queue status)
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate('requester', 'name email phone');
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const isOwner = request.requester._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    // If requester or admin, fetch matches and join donor details
    if (isOwner || isAdmin) {
      const rawMatches = await RequestDonorMatch.find({ request: request._id }).populate('donor', 'name email phone blood_type verification_status is_available');
      
      // Privacy Rule: Redact phone number and email unless accepted
      const matches = rawMatches.map(m => {
        const matchObj = m.toObject();
        if (m.response !== 'available') {
          matchObj.donor_phone = '[REDACTED]';
          matchObj.donor_email = '[REDACTED]';
          if (matchObj.donor) {
            matchObj.donor.phone = '[REDACTED]';
            matchObj.donor.email = '[REDACTED]';
          }
        } else {
          matchObj.donor_phone = m.donor.phone;
          matchObj.donor_email = m.donor.email;
        }
        return matchObj;
      });

      return res.json({
        ...request.toObject(),
        matches
      });
    }

    // Otherwise, check if user is in the match list
    const myMatch = await RequestDonorMatch.findOne({ request: request._id, donor: req.user.id });
    if (!myMatch) {
      return res.status(403).json({ error: 'Access denied: not matched to this request' });
    }

    return res.json({
      ...request.toObject(),
      myMatch
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/requests/:id/respond (Accept or decline a matched request)
router.post('/:id/respond', authenticateJWT, async (req, res) => {
  const { response } = req.body; // 'available' or 'unavailable'

  try {
    const match = await RequestDonorMatch.findOne({ request: req.params.id, donor: req.user.id });
    if (!match) {
      return res.status(404).json({ error: 'Match record not found' });
    }

    match.response = response;
    match.responded_at = new Date();
    await match.save();

    // Notify requester if available
    if (response === 'available') {
      const requestObj = await BloodRequest.findById(req.params.id);
      const donorUser = await User.findById(req.user.id);
      
      const notif = new Notification({
        recipient: requestObj.requester,
        type: 'blood_request',
        title: '❤️ Compatible Donor Found!',
        body: `A donor (${donorUser.blood_type}) responded Available to your request for ${requestObj.patient_name}.`,
        request_id: requestObj._id
      });
      await notif.save();
    }

    return res.json({ success: true, message: 'Response recorded', match });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/requests/:id/matches/:matchId/outcome (Admin / Owner: Record donation outcome)
router.post('/:id/matches/:matchId/outcome', authenticateJWT, async (req, res) => {
  const { outcome } = req.body; // 'donated', 'no_show', 'cancelled'

  try {
    const match = await RequestDonorMatch.findById(req.params.matchId).populate('donor');
    if (!match) {
      return res.status(404).json({ error: 'Match record not found' });
    }

    match.outcome = outcome;
    await match.save();

    if (outcome === 'donated') {
      // 1. Update donor fields
      const donorUser = match.donor;
      donorUser.donation_count = (donorUser.donation_count || 0) + 1;
      donorUser.last_donation_date = new Date().toISOString().split('T')[0];
      await donorUser.save();

      // 2. Log donation entry
      const history = new DonationHistory({
        donor: donorUser._id,
        request: match.request,
        units: 1
      });
      await history.save();

      // 3. Update Request fulfilled count
      const requestObj = await BloodRequest.findById(match.request);
      requestObj.units_fulfilled = (requestObj.units_fulfilled || 0) + 1;
      
      if (requestObj.units_fulfilled >= requestObj.units_needed) {
        requestObj.status = 'fulfilled';
      }
      await requestObj.save();

      // 4. Send thank you notification to donor
      const thankYouNotif = new Notification({
        recipient: donorUser._id,
        type: 'outcome_recorded',
        title: '❤️ Thank You for Donating!',
        body: `Your blood donation has been successfully recorded. Thank you for your generosity in saving lives.`,
        request_id: requestObj._id
      });
      await thankYouNotif.save();
      
      // Notify requester request status
      const requesterNotif = new Notification({
        recipient: requestObj.requester,
        type: 'outcome_recorded',
        title: requestObj.status === 'fulfilled' ? '🎉 Blood Request Fulfilled!' : '❤️ Donation Recorded',
        body: requestObj.status === 'fulfilled' 
          ? `Your blood request for ${requestObj.patient_name} has been fully fulfilled!`
          : `A donation has been recorded. ${requestObj.units_needed - requestObj.units_fulfilled} units left.`,
        request_id: requestObj._id
      });
      await requesterNotif.save();
    }

    return res.json({ success: true, message: 'Outcome recorded and user statistics updated' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
