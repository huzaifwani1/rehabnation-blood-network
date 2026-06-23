const express = require('express');
const router = express.Router();
const User = require('../models/User');
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

// GET /api/users/me/matches (Matched requests for logged in donor)
router.get('/me/matches', authenticateJWT, async (req, res) => {
  try {
    const matches = await require('../models/RequestDonorMatch').find({ donor: req.user.id })
      .populate({
        path: 'request',
        populate: { path: 'requester', select: 'name email phone' }
      });
    return res.json(matches);
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

// GET /api/users/search (Public/Protected Donor Search)
router.get('/search', async (req, res) => {
  const { blood_type, district, is_available, verification_status } = req.query;

  try {
    // Only search active, approved, non-flagged users with role = 'user'
    const query = {
      role: 'user',
      status: 'approved',
      is_flagged: false
    };

    if (blood_type) {
      query.blood_type = blood_type;
    }
    if (district) {
      query.district = district;
    }
    if (is_available) {
      query.is_available = is_available === 'available';
    }
    if (verification_status) {
      query.verification_status = verification_status;
    }

    const donors = await User.find(query).select('-password');
    return res.json(donors);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------------------------------
// ADMIN PORTAL USER MANAGEMENT ROUTES
// ----------------------------------------------------------------------------

// GET /api/users (Admin: List all users)
router.get('/', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ created_at: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/verify (Admin: Verify user status)
router.patch('/:id/verify', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { verification_status } = req.body; // 'camp_verified' or 'unverified'
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { verification_status: verification_status || 'camp_verified' } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, message: 'User verification updated', user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/flag (Admin: Flag/Unflag user)
router.patch('/:id/flag', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { is_flagged } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { is_flagged } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, message: `User flag updated to ${is_flagged}`, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PATCH /api/users/:id/suspend (Admin: Suspend/Approve user account)
router.patch('/:id/suspend', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const { status } = req.body; // 'suspended' or 'approved'
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ success: true, message: `Account status updated to ${status}`, user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id (Admin: Delete user account)
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ success: true, message: 'User account deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
