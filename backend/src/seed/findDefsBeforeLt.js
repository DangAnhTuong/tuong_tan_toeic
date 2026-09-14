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

async function findFunctionDefs() {
  const js = await getPage('https://dautoeic.com/assets/RoadmapPage-CUM6ZKYh.js');

  const p1Idx = js.indexOf('function Lt()');
  console.log('--- Functions before Lt() ---');
  console.log(js.slice(Math.max(0, p1Idx - 2500), p1Idx));
}

findFunctionDefs();
