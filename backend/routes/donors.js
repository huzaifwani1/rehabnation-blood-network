const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Donor = require('../models/Donor');
const User = require('../models/User');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// GET /api/donors (List & Search donors)
// - Hospitals can only see their own donors.
// - Admin can see all donors across all hospitals.
router.get('/', authenticateJWT, async (req, res) => {
  const { blood_type, district, search } = req.query;

  try {
    const query = {};

    // Enforce visibility constraint
    if (req.user.role === 'hospital') {
      query.hospital = req.user.id;
    }

    // Apply filters
    if (blood_type) {
      query.blood_type = blood_type;
    }
    if (district) {
      query.district = district;
    }
    if (search) {
      query.full_name = { $regex: search, $options: 'i' };
    }

    const donors = await Donor.find(query)
      .populate('hospital', 'name email phone district')
      .sort({ created_at: -1 });

    return res.json(donors);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/donors/stats (Statistics)
router.get('/stats', authenticateJWT, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // National statistics for Super Admin
      const totalHospitals = await User.countDocuments({ role: 'hospital' });
      const pendingHospitals = await User.countDocuments({ role: 'hospital', status: 'pending' });
      const approvedHospitals = await User.countDocuments({ role: 'hospital', status: 'approved' });
      const suspendedHospitals = await User.countDocuments({ role: 'hospital', status: 'suspended' });
      
      const totalDonors = await Donor.countDocuments({});
      
      // Group by blood type
      const bloodGroups = await Donor.aggregate([
        { $group: { _id: '$blood_type', count: { $sum: 1 } } }
      ]);

      const bloodTypeCounts = {};
      bloodGroups.forEach(g => {
        bloodTypeCounts[g._id] = g.count;
      });

      return res.json({
        totalHospitals,
        pendingHospitals,
        approvedHospitals,
        suspendedHospitals,
        totalDonors,
        bloodTypeCounts
      });
    } else {
      // Hospital specific stats
      const totalDonors = await Donor.countDocuments({ hospital: req.user.id });
      const bloodGroups = await Donor.aggregate([
        { $match: { hospital: new mongoose.Types.ObjectId(req.user.id) } },
        { $group: { _id: '$blood_type', count: { $sum: 1 } } }
      ]);

      const bloodTypeCounts = {};
      bloodGroups.forEach(g => {
        bloodTypeCounts[g._id] = g.count;
      });

      return res.json({
        totalDonors,
        bloodTypeCounts
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/donors (Create a donor record manually)
router.post('/', authenticateJWT, authorizeRoles('hospital', 'admin'), async (req, res) => {
  const { full_name, dob, gender, phone, email, blood_type, district, address, weight_kg, hemoglobin_level, last_donation_date, donation_count } = req.body;

  try {
    if (!full_name || !phone || !blood_type || !district) {
      return res.status(400).json({ error: 'Missing required donor fields (name, phone, blood type, or district)' });
    }

    const donorHospitalId = req.user.role === 'admin' ? req.body.hospital : req.user.id;
    if (!donorHospitalId) {
      return res.status(400).json({ error: 'Hospital association is required' });
    }

    const newDonor = new Donor({
      hospital: donorHospitalId,
      full_name,
      dob,
      gender,
      phone,
      email,
      blood_type,
      district,
      address,
      weight_kg: weight_kg ? Number(weight_kg) : undefined,
      hemoglobin_level: hemoglobin_level ? Number(hemoglobin_level) : undefined,
      last_donation_date,
      donation_count: donation_count ? Number(donation_count) : 0
    });

    await newDonor.save();
    return res.status(201).json({ success: true, donor: newDonor });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/donors/import (Import donor records from Excel/CSV parsed JSON array)
router.post('/import', authenticateJWT, authorizeRoles('hospital'), async (req, res) => {
  const { donors } = req.body;

  if (!donors || !Array.isArray(donors)) {
    return res.status(400).json({ error: 'Invalid payload: expected an array of donor records.' });
  }

  try {
    const recordsToInsert = donors.map(d => ({
      hospital: req.user.id,
      full_name: d.full_name || d.name,
      dob: d.dob,
      gender: d.gender || 'male',
      phone: d.phone || d.phone_number,
      email: d.email,
      blood_type: d.blood_type || d.blood_group,
      district: d.district || req.user.district || 'Unknown',
      address: d.address || '',
      weight_kg: d.weight_kg ? Number(d.weight_kg) : undefined,
      hemoglobin_level: d.hemoglobin_level ? Number(d.hemoglobin_level) : undefined,
      last_donation_date: d.last_donation_date || '',
      donation_count: d.donation_count ? Number(d.donation_count) : 0,
      verification_status: d.verification_status || 'unverified',
      is_available: d.is_available ?? true
    }));

    // Filter out rows missing required properties
    const validRecords = recordsToInsert.filter(r => r.full_name && r.phone && r.blood_type);

    if (validRecords.length === 0) {
      return res.status(400).json({ error: 'No valid donor records found to import. Verify name, phone, and blood type fields.' });
    }

    const inserted = await Donor.insertMany(validRecords);
    return res.status(201).json({ success: true, count: inserted.length });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/donors/:id (Edit a donor record)
router.put('/:id', authenticateJWT, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor record not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && donor.hospital.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: unauthorized donor modification' });
    }

    const updates = req.body;
    delete updates.hospital; // Prevent moving donors to other hospitals directly

    const updatedDonor = await Donor.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    return res.json({ success: true, donor: updatedDonor });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/donors/:id (Remove donor record)
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ error: 'Donor record not found' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && donor.hospital.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: unauthorized donor deletion' });
    }

    await Donor.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Donor record deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
