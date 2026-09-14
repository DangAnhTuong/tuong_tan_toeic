const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const User = require('../models/User');
  const u1 = await User.findOne({ email: 'tuongneeee@gmail.com' });
  const u2 = await User.findOne({ email: 'danganhtuongg@gmail.com' });
  console.log('tuongneeee:', u1 ? { email: u1.email, role: u1.role, isPro: u1.isPro } : 'NOT FOUND');
  console.log('danganhtuongg:', u2 ? { email: u2.email, role: u2.role, isPro: u2.isPro } : 'NOT FOUND');
  process.exit(0);
});
