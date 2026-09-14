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

async function findChunks() {
  const indexJs = await getPage('https://dautoeic.com/assets/index-Db8LzapG.js');
  // Find other asset chunk names
  const chunks = [...indexJs.matchAll(/assets\/[a-zA-Z0-9_\-\.]+\.js/g)].map(m => m[0]);
  console.log('Found chunks in indexJs:', [...new Set(chunks)]);

  for (const chunk of [...new Set(chunks)]) {
    const chunkContent = await getPage(`https://dautoeic.com/${chunk}`);
    if (chunkContent.includes('skeleton') || chunkContent.includes('passages') || chunkContent.includes('mock')) {
      console.log(`Matched keyword in ${chunk}!`);
      const matches = [...chunkContent.matchAll(/[a-zA-Z0-9_]*skeleton[a-zA-Z0-9_]*/g)].map(m => m[0]);
      console.log('Matches:', [...new Set(matches)]);
      
      const idx = chunkContent.indexOf('skeleton');
      console.log('Context:', chunkContent.slice(Math.max(0, idx - 150), Math.min(chunkContent.length, idx + 300)));
    }
  }
}

findChunks();
