const mongoose = require('mongoose');

async function cleanup() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('Connected to MongoDB.');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const PaymentOrder = mongoose.model('PaymentOrder', new mongoose.Schema({}, { strict: false }));
  const UserGoal = mongoose.model('UserGoal', new mongoose.Schema({}, { strict: false }));

  // Delete specific personal & test emails
  const targetEmails = [
    'danganhtuongg@gmail.com',
    'ou48187@gmail.com',
    'danganhtuan25112008@gmail.com',
    'user_other@gmail.com'
  ];

  const res1 = await User.deleteMany({
    $or: [
      { email: { $in: targetEmails } },
      { email: { $regex: /audit_user|test/i } }
    ]
  });

  const res2 = await PaymentOrder.deleteMany({});
  const res3 = await UserGoal.deleteMany({
    $or: [
      { userId: { $in: targetEmails } },
      { userId: 'tuandang_default_user' }
    ]
  });

  console.log(`Deleted ${res1.deletedCount} users.`);
  console.log(`Deleted ${res2.deletedCount} payment orders.`);
  console.log(`Deleted ${res3.deletedCount} user goals.`);

  const remaining = await User.find({}, 'email fullName role isPro');
  console.log('Remaining User Accounts:', remaining);

  await mongoose.disconnect();
  console.log('Cleanup finished successfully.');
}

cleanup().catch(err => {
  console.error('Cleanup error:', err);
  process.exit(1);
});
