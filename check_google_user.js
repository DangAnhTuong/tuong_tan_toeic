const { execSync } = require('child_process');

const remoteScript = `
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
`;

require('fs').writeFileSync('a:/frontend/tuong_tan_toeic/backend/src/seed/check_user_google.js', remoteScript);
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\check_user_google.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });
const res = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/check_user_google.js"').toString();
console.log(res);
