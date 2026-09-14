const { execSync } = require('child_process');

console.log('1. Uploading translation files to VPS...');
execSync('scp a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\masterPromptTranslations.json a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\healAllRemainingPromptsAndOptions.js root@116.118.3.69:/var/www/tuong-tan-toeic/backend/src/seed/', { stdio: 'inherit' });

console.log('2. Running healAllRemainingPromptsAndOptions.js on VPS...');
const healOut = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/healAllRemainingPromptsAndOptions.js"').toString();
console.log(healOut);

console.log('3. Re-running exhaustive audit on VPS to verify zero defects...');
const auditOut = execSync('ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/backend; node src/seed/inspect_all_defects_exhaustive.js"').toString();
console.log(auditOut);

console.log('4. Downloading updated audit results...');
execSync('scp root@116.118.3.69:/var/www/tuong-tan-toeic/backend/all_untranslated_exhaustive.json a:\\frontend\\tuong_tan_toeic\\backend\\src\\seed\\all_untranslated_exhaustive_healed.json', { stdio: 'inherit' });

console.log('ALL HEALING AND AUDITING DONE!');
