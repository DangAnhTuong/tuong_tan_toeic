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

async function findClassificationFunctions() {
  const js = await getPage('https://dautoeic.com/assets/RoadmapPage-CUM6ZKYh.js');

  // Search around `bt(`, `vt(`, `Pt(`, `phototype`
  const keywords = ['phototype', 'part2-question-types', 'part3-context-types', 'part4-topic-types', 'grammar-difficulty'];
  
  for (const kw of keywords) {
    const idx = js.indexOf(kw);
    if (idx !== -1) {
      console.log(`\n=== Keyword: ${kw} ===`);
      console.log(js.slice(Math.max(0, idx - 300), Math.min(js.length, idx + 600)));
    }
  }
}

findClassificationFunctions();
