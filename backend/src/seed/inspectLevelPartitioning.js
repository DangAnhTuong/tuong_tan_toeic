const https = require('https');

function getPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspectLevelPartitioning() {
  const chunks = ['assets/RoadmapPage-CUM6ZKYh.js', 'assets/index-Db8LzapG.js'];
  for (const c of chunks) {
    const content = await getPage(`https://dautoeic.com/${c}`);
    const matches = [...content.matchAll(/difficulty[a-zA-Z0-9_\-\:]+/g)].map(m => m[0]);
    console.log(`Matches in ${c}:`, [...new Set(matches)]);
    
    const idx = content.indexOf('difficulty-practice');
    if (idx !== -1) {
      console.log(`\nContext of difficulty-practice in ${c}:`);
      console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 400)));
    }
  }
}

inspectLevelPartitioning();
