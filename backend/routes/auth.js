const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtsecretkey123!';

// Helper to validate email format
const validateEmail = (email) => {
  if (!email) return true; // Optional now
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, full_name, phone, ...rest } = req.body;

  try {
    if (email && email.trim() && !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!full_name || !full_name.trim()) {
      return res.status(400).json({ error: 'Full name is required' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if email already exists
    if (email && email.trim()) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ error: 'Account already exists with this email' });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Get initials
    const initials = full_name
      ? full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'U';

    const newUser = new User({
      name: full_name.trim(),
      email: email ? email.trim().toLowerCase() : '',
      phone: phone.trim(),
      password: passwordHash,
      initials,
      role: 'user', // Defaults to standard user
      ...rest
    });

    await newUser.save();

    // Create JWT Token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove password from returned user object
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(400).json({ error: 'Account does not exist' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account has been suspended' });
    }

    // Create JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
