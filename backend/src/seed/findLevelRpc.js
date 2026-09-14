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

async function findLevelRpc() {
  const content = await getPage('https://dautoeic.com/assets/RoadmapPage-CUM6ZKYh.js');
  
  // Find all RPC calls: .rpc("...")
  const rpcs = [...content.matchAll(/\.rpc\("([^"]+)"/g)].map(m => m[1]);
  console.log('All RPC calls in RoadmapPage:', [...new Set(rpcs)]);

  for (const r of [...new Set(rpcs)]) {
    const idx = content.indexOf(`"${r}"`);
    console.log(`\nRPC: ${r}`);
    console.log(content.slice(Math.max(0, idx - 100), Math.min(content.length, idx + 250)));
  }
}

findLevelRpc();
