const mongoose = require('mongoose');
const PaymentOrder = require('../models/PaymentOrder');

const sampleOrders = [
  { orderCode: 'TOEIC84920', userId: 'student_001', planId: 'pro_3m', planName: 'Gói Bứt Phá (3 Tháng)', amount: 199000, durationDays: 90, status: 'PAID', bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' }, paidAt: new Date() },
  { orderCode: 'TOEIC63812', userId: 'student_002', planId: 'pro_lifetime', planName: 'Gói VIP Trọn Đời (Lifetime)', amount: 399000, durationDays: 36500, status: 'PAID', bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' }, paidAt: new Date(Date.now() - 3600000) },
  { orderCode: 'TOEIC91204', userId: 'student_004', planId: 'pro_3m', planName: 'Gói Bứt Phá (3 Tháng)', amount: 199000, durationDays: 90, status: 'PAID', bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' }, paidAt: new Date(Date.now() - 7200000) },
  { orderCode: 'TOEIC44018', userId: 'student_007', planId: 'pro_1m', planName: 'Gói Cấp Tốc (1 Tháng)', amount: 99000, durationDays: 30, status: 'PAID', bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' }, paidAt: new Date(Date.now() - 18000000) },
  { orderCode: 'TOEIC58737', userId: 'student_009', planId: 'pro_3m', planName: 'Gói Bứt Phá (3 Tháng)', amount: 199000, durationDays: 90, status: 'PAID', bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' }, paidAt: new Date(Date.now() - 36000000) },
  { orderCode: 'TOEIC12940', userId: 'student_003', planId: 'pro_1m', planName: 'Gói Cấp Tốc (1 Tháng)', amount: 99000, durationDays: 30, status: 'PENDING', bankInfo: { bankId: 'MB', accountNo: '0335847674', accountName: 'DANG ANH TUONG' } }
];

async function seedOrders() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
    console.log('Connected to MongoDB');

    for (const order of sampleOrders) {
      await PaymentOrder.findOneAndUpdate(
        { orderCode: order.orderCode },
        order,
        { upsert: true, new: true }
      );
    }

    console.log('✅ Seeded sample VietQR payment orders successfully.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding orders:', error);
  }
}

seedOrders();
