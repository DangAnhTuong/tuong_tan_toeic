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

async function inspectPart345Types() {
  const js = await getPage('https://dautoeic.com/assets/RoadmapPage-CUM6ZKYh.js');

  // Search for labels of Part 3 context types and Part 4 topic types and Part 5 grammar types
  const p3Idx = js.indexOf('Mt=');
  if (p3Idx !== -1) {
    console.log('--- Part 3 Context Types ---');
    console.log(js.slice(p3Idx, p3Idx + 500));
  } else {
    // Search around `part3-context-types`
    const idx2 = js.indexOf('part3-context-types');
    console.log('--- Context near part3-context-types ---');
    console.log(js.slice(Math.max(0, idx2 - 500), idx2 + 200));
  }

  const p4Idx = js.indexOf('part4-topic-types');
  console.log('\n--- Context near part4-topic-types ---');
  console.log(js.slice(Math.max(0, p4Idx - 500), p4Idx + 200));
}

inspectPart345Types();
