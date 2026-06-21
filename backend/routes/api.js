const express = require('express');
const router = express.Router();
const { findCompatibleDonors } = require('../matching');

// --- Mock DB Wrapper for Routing Illustration ---
// In production, this would import models initialized via Sequelize
const mockDb = {}; 

// ----------------------------------------------------------------------------
// MIDDLEWARES
// ----------------------------------------------------------------------------

// Checks if the user is authenticated (JWT validation)
function authenticateJWT(req, res, next) {
  // Simulating token verification: in production, decode req.headers.authorization
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  
  // For demo, assume header contains role like "Bearer admin" or "Bearer donor"
  const token = authHeader.split(' ')[1];
  req.user = {
    id: 'u-user-id-xyz',
    role: token || 'donor', // Fallback role
  };
  next();
}

// Gates route access to specific roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied. Unauthorized role.' });
    }
    next();
  };
}

// ----------------------------------------------------------------------------
// AUTHENTICATION ENDPOINTS
// ----------------------------------------------------------------------------

router.post('/auth/register', async (req, res) => {
  const { email, password, role, full_name, district, ...extraFields } = req.body;
  try {
    // 1. Create User credentials
    // 2. Based on role, create Donor or Hospital Profile
    return res.status(201).json({
      message: 'Registration successful',
      user: { email, role, is_active: true }
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  // Verify credentials, issue JWT
  return res.json({
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Mock JWT
    role: 'donor',
    user: { email }
  });
});

// ----------------------------------------------------------------------------
// DONOR PORTAL ENDPOINTS
// ----------------------------------------------------------------------------

// Fetch self profile
router.get('/donors/me', authenticateJWT, authorizeRoles('donor'), async (req, res) => {
  // Fetch donor details where user_id = req.user.id
  return res.json({
    full_name: 'Amara Okonkwo',
    blood_group: 'O-',
    is_available: true,
    verification_status: 'camp_verified',
    total_donations: 12,
  });
});

// Toggle availability status
router.patch('/donors/me/availability', authenticateJWT, authorizeRoles('donor'), async (req, res) => {
  const { is_available } = req.body;
  // Update record is_available = is_available
  return res.json({ message: 'Availability status updated successfully', is_available });
});

// ----------------------------------------------------------------------------
// HOSPITAL EMERGENCY REQUESTS & MATCHES
// ----------------------------------------------------------------------------

// Create blood request
router.post('/hospitals/requests', authenticateJWT, authorizeRoles('hospital', 'admin'), async (req, res) => {
  const { blood_group, units_needed, urgency, district, address, expiry_time } = req.body;
  
  try {
    // 1. Create emergency request in database
    const newRequest = {
      id: 'req-uuid-123',
      hospital_id: 'hosp-uuid-abc',
      blood_group,
      units_needed,
      units_fulfilled: 0,
      urgency,
      district,
      address,
      status: 'open',
      expiry_time,
    };

    // 2. Perform matching logic
    const matchedDonors = await findCompatibleDonors(mockDb, { blood_group, district });

    // 3. Queue matching notifications for matching donors
    // 4. Populate request_donor_matches link table

    return res.status(201).json({
      message: 'Emergency request created and matching notifications dispatched.',
      request: newRequest,
      matched_count: matchedDonors.length,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// Fetch detailed donor match queue status
router.get('/hospitals/requests/:id', authenticateJWT, authorizeRoles('hospital', 'admin'), async (req, res) => {
  const requestId = req.params.id;

  // Security Rule: Ensure hospital owns the request (unless admin)
  // Retrieve request details and join with request_donor_matches and donors.
  
  // Privacy Rule: Redact phone number and email unless response = 'available'
  const mockMatches = [
    {
      donor_name: 'Amara Okonkwo',
      blood_group: 'O-',
      response: 'available',
      phone_number: '+2348012345678', // Revealed!
      email: 'amara@example.com', // Revealed!
      outcome: 'pending',
    },
    {
      donor_name: 'Hidden Donor 1',
      blood_group: 'O+',
      response: 'pending',
      phone_number: '[REDACTED - Pending Acceptance]', // Hidden!
      email: '[REDACTED - Pending Acceptance]', // Hidden!
      outcome: 'pending',
    }
  ];

  return res.json({
    request_id: requestId,
    blood_group: 'O-',
    units_needed: 2,
    status: 'open',
    matches: mockMatches,
  });
});

// Respond to an emergency request (Accept / Decline)
router.post('/requests/:id/respond', authenticateJWT, authorizeRoles('donor'), async (req, res) => {
  const requestId = req.params.id;
  const { response } = req.body; // 'available' or 'unavailable'

  // Update match record status
  // If response === 'available', notify hospital and reveal contact details
  
  return res.json({
    message: response === 'available' 
      ? 'Thank you! Your contact details have been shared with the hospital.' 
      : 'Response recorded. Thank you for your feedback.',
    response,
  });
});

// Record outcome of match
router.post('/requests/:id/matches/:matchId/outcome', authenticateJWT, authorizeRoles('hospital', 'admin'), async (req, res) => {
  const { outcome } = req.body; // 'donated', 'no_show', 'cancelled'
  
  // 1. Update outcome in request_donor_matches table
  // 2. If outcome === 'donated':
  //    - Increment donor's total_donations count
  //    - Update donor's last_donation_date to today
  //    - Log donation entry in donation_history table
  // 3. Recalculate and update emergency_requests.units_fulfilled
  // 4. Send thank-you notification to donor

  return res.json({
    message: 'Donation outcome recorded and donor statistics updated.',
    outcome,
  });
});

// ----------------------------------------------------------------------------
// ADMIN MANAGEMENT ENDPOINTS
// ----------------------------------------------------------------------------

router.patch('/admin/donors/:id/verify', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const donorId = req.params.id;
  // Update donor verification_status = 'camp_verified'
  return res.json({ message: 'Donor verified through RehabNation Camp', donorId });
});

router.patch('/admin/donors/:id/flag', authenticateJWT, authorizeRoles('admin'), async (req, res) => {
  const donorId = req.params.id;
  const { is_flagged } = req.body;
  // Update donor is_flagged
  return res.json({ message: `Donor status updated. Flagged: ${is_flagged}`, donorId });
});

module.exports = router;
