const { execSync } = require('child_process');

console.log('1. Uploading inspect_all_defects_exhaustive.js to VPS...');
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\inspect_all_defects_exhaustive.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });

console.log('2. Running inspection on VPS...');
const out = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/inspect_all_defects_exhaustive.js"').toString();
console.log(out);

console.log('3. Downloading all_untranslated_exhaustive.json...');
execSync('scp root@116.118.3.69:/var/www/tuong-tan-toeic/backend/all_untranslated_exhaustive.json a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\', { stdio: 'inherit' });

console.log('DONE!');
