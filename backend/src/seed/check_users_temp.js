
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
