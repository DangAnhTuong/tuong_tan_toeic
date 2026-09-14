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

async function findRpcSignatures() {
  const js = await getPage('https://dautoeic.com/assets/index-Db8LzapG.js');
  
  // Find occurrences of get_mock_
  const matches = [...js.matchAll(/get_mock_[a-zA-Z0-9_]+/g)].map(m => m[0]);
  const uniqueMatches = [...new Set(matches)];
  console.log('Found RPCs:', uniqueMatches);

  for (const rpc of uniqueMatches) {
    const idx = js.indexOf(rpc);
    if (idx !== -1) {
      console.log(`\n--- Snippet for ${rpc} ---`);
      console.log(js.slice(Math.max(0, idx - 100), Math.min(js.length, idx + 250)));
    }
  }
}

findRpcSignatures();
