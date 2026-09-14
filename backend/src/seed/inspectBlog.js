const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const js = await get('https://dautoeic.com/assets/BlogHome-DSzHyx07.js');
  console.log('BlogHome JS length:', js.length);
  fs.writeFileSync(path.join(__dirname, 'raw_BlogHome.js'), js, 'utf8');
  console.log('Saved raw_BlogHome.js');
  
  // Also check imports in BlogHome
  const imports = [...js.matchAll(/import\([^)]+\)/g)].map(m => m[0]);
  console.log('Imports in BlogHome:', imports);
}

main().catch(console.error);
