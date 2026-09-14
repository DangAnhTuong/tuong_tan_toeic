const { execSync } = require('child_process');

console.log('Uploading check_vps_q565.js...');
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\check_vps_q565.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });

console.log('Running check on VPS...');
const out = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/check_vps_q565.js"').toString();
console.log(out);
