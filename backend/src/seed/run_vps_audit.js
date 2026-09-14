const { execSync } = require('child_process');

console.log('1. Uploading audit_all_questions_deep.js to VPS...');
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\audit_all_questions_deep.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });

console.log('2. Running audit on VPS...');
const out = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/audit_all_questions_deep.js"').toString();
console.log(out);

console.log('3. Downloading audit_deep_results.json from VPS...');
execSync('scp root@116.118.3.69:/var/www/tuong-tan-toeic/backend/audit_deep_results.json a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\', { stdio: 'inherit' });

console.log('DONE!');
