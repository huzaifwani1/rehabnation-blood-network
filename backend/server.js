const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rehabnation';
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully.');
    await seedAdminUser();
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
  });

// Seed default administrator if not present
async function seedAdminUser() {
  try {
    const adminEmail = 'admin@rehabnation.org';
    const adminExists = await User.findOne({ email: adminEmail });

    if (!adminExists) {
      console.log('Seeding default administrator account...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);

      const adminUser = new User({
        name: 'RehabNation Admin',
        email: adminEmail,
        phone: '1234567890',
        password: hashedPassword,
        district: 'Lagos Mainland',
        address: 'RehabNation HQ',
        role: 'admin',
        initials: 'RA',
        status: 'approved'
      });

      await adminUser.save();
      console.log('Admin account created successfully.');
    }
  } catch (error) {
    console.error('Error seeding admin user:', error);
  }
}

// Routes mount
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/requests', require('./routes/requests'));
app.use('/api/notifications', require('./routes/notifications'));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
