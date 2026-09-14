const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const PaymentOrder = require('../models/PaymentOrder');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const u = await User.findOne({ email: 'ou48187@gmail.com' });
  console.log('USER:', {
    id: u?._id,
    email: u?.email,
    isPro: u?.isPro,
    proTier: u?.proTier,
    proExpiresAt: u?.proExpiresAt
  });
  const o = await PaymentOrder.findOne({ 
    $or: [{ userId: u?._id?.toString() }, { userId: u?.email }] 
  }).sort({ createdAt: -1 });
  console.log('LATEST ORDER:', {
    orderCode: o?.orderCode,
    status: o?.status,
    amount: o?.amount,
    paidAt: o?.paidAt,
    createdAt: o?.createdAt
  });
  await mongoose.disconnect();
}

check().catch(console.error);
