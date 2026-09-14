const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true }, // e.g., TOEIC12345
  userId: { type: String, required: true, default: 'guest_user' },
  planId: { 
    type: String, 
    required: true 
  },
  planName: { type: String, required: true },
  amount: { type: Number, required: true }, // in VND
  currency: { type: String, default: 'VND' },
  status: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'EXPIRED', 'CANCELLED'], 
    default: 'PENDING' 
  },
  qrUrl: { type: String },
  bankInfo: {
    bankId: { type: String, default: 'MB' },
    accountNo: { type: String, default: '0335847674' },
    accountName: { type: String, default: 'DANG ANH TUONG' }
  },
  transferContent: { type: String, required: true },
  paidAt: { type: Date, default: null },
  webhookPayload: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
