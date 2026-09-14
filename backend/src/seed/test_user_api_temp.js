
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: '/var/www/tuong-tan-toeic/backend/.env' });

const JWT_SECRET = process.env.JWT_SECRET || 'tuong_tan_toeic_jwt_secret_key_2026_super_secure';
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const User = require('../models/User');
  const user = await User.findOne({ email: 'ou48187@gmail.com' });
  console.log('User found:', user.email, 'isPro:', user.isPro, 'role:', user.role);

  const token = jwt.sign({ id: user._id, email: user.email, role: user.role, isPro: user.isPro }, JWT_SECRET, { expiresIn: '30d' });
  
  const axios = require('axios');
  try {
    const resProfile = await axios.get('http://127.0.0.1:5000/api/v1/user/profile', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('API /api/v1/user/profile result: isPro =', resProfile.data?.data?.isPro, 'role =', resProfile.data?.data?.role);
  } catch (err) {
    console.error('API /user/profile error:', err.response?.data || err.message);
  }

  try {
    const resStatus = await axios.get('http://127.0.0.1:5000/api/v1/payment/my-status', {
      headers: { Authorization: 'Bearer ' + token }
    });
    console.log('API /api/v1/payment/my-status result: isPro =', resStatus.data?.isPro, 'proTier =', resStatus.data?.proTier);
  } catch (err) {
    console.error('API /payment/my-status error:', err.response?.data || err.message);
  }

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
