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

async function inspectModeType() {
  const chunks = ['assets/RoadmapPage-CUM6ZKYh.js', 'assets/index-Db8LzapG.js'];
  for (const chunk of chunks) {
    const js = await getPage(`https://dautoeic.com/${chunk}`);
    console.log(`\n=== Chunk: ${chunk} ===`);
    
    // Look for "Tranh một người", "Tranh nhiều người", "Tranh cảnh vật"
    const p1Matches = [...js.matchAll(/(Tranh một người|Tranh nhiều người|Tranh cảnh vật|Theo dạng bài|phototype|qtype|subtype)/g)].map(m => m[0]);
    console.log('Matches:', [...new Set(p1Matches)]);

    const idx = js.indexOf('Tranh một người');
    if (idx !== -1) {
      console.log('\nContext around "Tranh một người":');
      console.log(js.slice(Math.max(0, idx - 150), Math.min(js.length, idx + 400)));
    }
  }
}

inspectModeType();
