const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtsecretkey123!';

// Helper to validate email format
const validateEmail = (email) => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  console.log('HOSPITAL REGISTER REQUEST RECEIVED');
  const { 
    email, 
    password, 
    name, 
    blood_bank_name, 
    registration_number, 
    hospital_type, 
    contact_person, 
    phone, 
    address, 
    district, 
    state 
  } = req.body;
  
  try {
    if (!email || !email.trim() || !validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Hospital name is required' });
    }

    if (!registration_number || !registration_number.trim()) {
      return res.status(400).json({ error: 'Registration number is required' });
    }

    if (!hospital_type || !hospital_type.trim()) {
      return res.status(400).json({ error: 'Hospital type is required' });
    }

    if (!contact_person || !contact_person.trim()) {
      return res.status(400).json({ error: 'Contact person is required' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    if (!district || !district.trim()) {
      return res.status(400).json({ error: 'District is required' });
    }

    if (!state || !state.trim()) {
      return res.status(400).json({ error: 'State is required' });
    }

    if (!address || !address.trim()) {
      return res.status(400).json({ error: 'Address is required' });
    }

    // Check if email already exists
    const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ error: 'Account already exists with this email' });
    }

    // Check if registration number exists
    const regExists = await User.findOne({ registration_number: registration_number.trim() });
    if (regExists) {
      return res.status(400).json({ error: 'Hospital registration number is already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Get initials
    const initials = name
      ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : 'H';

    const newUser = new User({
      name: name.trim(),
      blood_bank_name: blood_bank_name ? blood_bank_name.trim() : undefined,
      registration_number: registration_number.trim(),
      hospital_type: hospital_type.trim(),
      contact_person: contact_person.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
      address: address.trim(),
      district: district.trim(),
      state: state.trim(),
      initials,
      role: 'hospital',
      status: 'pending' // pending approval
    });

    console.log('ATTEMPTING HOSPITAL SAVE');
    await newUser.save();
    console.log('HOSPITAL SAVED SUCCESSFULLY');

    // Create JWT Token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('HOSPITAL REGISTER ERROR:', error);
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

    if (user.role === 'hospital' && user.status === 'pending') {
      return res.status(403).json({ error: 'Your organization account is pending approval by RehabNation Admin.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Your account has been suspended/disabled.' });
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
