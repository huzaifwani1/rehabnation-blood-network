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

// DELETE /api/users/me (Delete self account & cascade clean associated Mongoose documents)
router.delete('/me', authenticateJWT, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Delete user document
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Cascade delete all owned blood requests
    const userRequests = await require('../models/BloodRequest').find({ requester: userId });
    const requestIds = userRequests.map(r => r._id);

    // Delete matches linked to those requests
    await require('../models/RequestDonorMatch').deleteMany({ request: { $in: requestIds } });

    // Delete notifications linked to those requests
    await require('../models/Notification').deleteMany({ request_id: { $in: requestIds } });

    // Delete donation history linked to those requests
    await require('../models/DonationHistory').deleteMany({ request: { $in: requestIds } });

    // Delete the blood requests themselves
    await require('../models/BloodRequest').deleteMany({ requester: userId });

    // 3. Cascade delete all matches where user was the donor
    await require('../models/RequestDonorMatch').deleteMany({ donor: userId });

    // 4. Cascade delete all notifications sent to this user
    await require('../models/Notification').deleteMany({ recipient: userId });

    // 5. Cascade delete all donation history where user was the donor
    await require('../models/DonationHistory').deleteMany({ donor: userId });

    return res.json({ success: true, message: 'Account and all associated records deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/users/me/fcm-token (Register/Save FCM token for push notifications)
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

    // Add token if it does not already exist
    if (!userObj.fcm_tokens.includes(token)) {
      userObj.fcm_tokens.push(token);
      await userObj.save();
    }

    return res.json({ success: true, message: 'FCM Token registered successfully' });
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
