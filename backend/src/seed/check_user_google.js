
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const User = require('../models/User');
  const u = await User.findOne({ $or: [{ userId: 'google_1788885761181_bdwdj' }, { googleId: 'google_1788885761181_bdwdj' }] });
  console.log('User by google_id:', u ? { id: u._id, email: u.email, fullName: u.fullName, isPro: u.isPro, proTier: u.proTier, proExpiresAt: u.proExpiresAt } : 'NOT FOUND');

  const allUsers = await User.find({}, 'email fullName userId googleId isPro proTier proExpiresAt').lean();
  console.log('ALL USERS:', JSON.stringify(allUsers, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
