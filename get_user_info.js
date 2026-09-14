const { execSync } = require('child_process');

const remoteScript = `
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
`;

require('fs').writeFileSync('a:/frontend/tuong_tan_toeic/backend/src/seed/get_user_info_temp.js', remoteScript);
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\get_user_info_temp.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });
const res = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/get_user_info_temp.js"').toString();
console.log(res);
