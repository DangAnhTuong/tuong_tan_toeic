const { execSync } = require('child_process');

const remoteScript = `
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const User = require('../models/User');
  const PaymentOrder = require('../models/PaymentOrder');

  const users = await User.find({}).sort({ updatedAt: -1 }).limit(10).lean();
  console.log('=== USERS ===');
  console.log(JSON.stringify(users.map(u => ({ id: u._id, email: u.email, fullName: u.fullName, isPro: u.isPro, proTier: u.proTier, proExpiresAt: u.proExpiresAt, role: u.role })), null, 2));

  const orders = await PaymentOrder.find({}).sort({ createdAt: -1 }).limit(5).lean();
  console.log('=== ORDERS ===');
  console.log(JSON.stringify(orders.map(o => ({ orderCode: o.orderCode, userId: o.userId, amount: o.amount, status: o.status, createdAt: o.createdAt, paidAt: o.paidAt })), null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
`;

require('fs').writeFileSync('A:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\check_users_temp.js', remoteScript);
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\check_users_temp.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });
const res = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/check_users_temp.js"').toString();
console.log(res);
