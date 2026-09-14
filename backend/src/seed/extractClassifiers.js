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

async function extractClassifierCode() {
  const js = await getPage('https://dautoeic.com/assets/RoadmapPage-CUM6ZKYh.js');

  // Let's find function wr(
  const wrIdx = js.indexOf('function wr(');
  if (wrIdx !== -1) {
    console.log('--- wr (Part 1 classifier) ---');
    console.log(js.slice(wrIdx, wrIdx + 1200));
  } else {
    // Search `wr=` or `wr =`
    const matches = [...js.matchAll(/[a-zA-Z0-9_]+=[a-zA-Z0-9_]*\(?n\)?=>/g)].map(m => m[0]);
    console.log('Matches:', matches.slice(0, 10));
    
    // Find where "Tranh một người" or "one_person" or "people" or "object" is mapped
    const p1Idx = js.indexOf('part1-photo-types');
    console.log('--- Part 1 Context ---');
    console.log(js.slice(Math.max(0, p1Idx - 1000), p1Idx + 500));
  }
}

extractClassifierCode();
