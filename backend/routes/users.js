const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Donor = require('../models/Donor');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// GET /api/users/me
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/me
router.put('/me', authenticateJWT, async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow changing role or status via this endpoint
    delete updates.role;
    delete updates.status;
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/me (Delete self account & cascade clean associated donor records)
router.delete('/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Delete hospital document
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Cascade delete all owned donors
    await Donor.deleteMany({ hospital: userId });

    return res.json({ success: true, message: 'Account and all associated donor records deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/users/me/fcm-token
router.post('/me/fcm-token', authenticateJWT, async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    const userObj = await User.findById(req.user.id);
    if (!userObj) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!userObj.fcm_tokens.includes(token)) {
      userObj.fcm_tokens.push(token);
      await userObj.save();
    }

    return res.json({ success: true, message: 'FCM Token registered successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// ADMIN PORTAL HOSPITAL MANAGEMENT ROUTES
// ----------------------------------------------------------------------------

// GET /api/users (Admin: List all hospitals)
router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    // Return all hospital accounts (exclude admins)
    const users = await User.find({ role: 'hospital' }).select('-password').sort({ created_at: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/suspend (Admin: Suspend/Approve/Approve hospital account)
router.patch('/:id/suspend', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { status } = req.body; // 'suspended', 'approved', 'pending'
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    return res.json({ success: true, message: `Hospital account status updated to ${status}`, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id (Admin: Delete hospital account)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // Cascade delete donors
    await Donor.deleteMany({ hospital: req.params.id });

    return res.json({ success: true, message: 'Hospital account and all associated donor records deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id (Admin: Fetch single hospital profile)
router.get('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'Hospital not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id/stats (Admin: Per-hospital donor statistics)
router.get('/:id/stats', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const hospitalId = new mongoose.Types.ObjectId(req.params.id);

    const totalDonors  = await Donor.countDocuments({ hospital: hospitalId });
    const activeDonors = await Donor.countDocuments({ hospital: hospitalId, is_available: true });

    const bloodGroups = await Donor.aggregate([
      { $match: { hospital: hospitalId } },
      { $group: { _id: '$blood_type', count: { $sum: 1 } } }
    ]);
    const bloodTypeCounts = {};
    bloodGroups.forEach(g => { bloodTypeCounts[g._id] = g.count; });

    const lastDonor = await Donor.findOne({ hospital: hospitalId })
      .sort({ created_at: -1 })
      .select('full_name last_donation_date created_at');

    return res.json({ totalDonors, activeDonors, bloodTypeCounts, lastActivity: lastDonor?.created_at });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
