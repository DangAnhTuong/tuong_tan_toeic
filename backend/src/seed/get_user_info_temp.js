
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic').then(async () => {
  const User = require('../models/User');
  const u = await User.findOne({ email: 'ou48187@gmail.com' }).lean();
  console.log('USER ou48187:');
  console.log(JSON.stringify(u, null, 2));

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
