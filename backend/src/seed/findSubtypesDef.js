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

async function findSubtypesDefinition() {
  const js = await getPage('https://dautoeic.com/assets/RoadmapPage-CUM6ZKYh.js');
  
  const occurrences = [];
  let pos = 0;
  while ((pos = js.indexOf('phototype', pos)) !== -1) {
    occurrences.push(pos);
    pos += 9;
  }

  console.log('Occurrences of phototype:', occurrences.length);
  for (const p of occurrences) {
    console.log('\n--- Snippet ---');
    console.log(js.slice(Math.max(0, p - 100), Math.min(js.length, p + 300)));
  }

  // Also check for grammar difficulty or part subtypes
  const p2Occurrences = [];
  pos = 0;
  while ((pos = js.indexOf('get_part2_question_stems', pos)) !== -1) {
    p2Occurrences.push(pos);
    pos += 24;
  }
  for (const p of p2Occurrences) {
    console.log('\n--- Part 2 Stems Snippet ---');
    console.log(js.slice(Math.max(0, p - 100), Math.min(js.length, p + 500)));
  }
}

findSubtypesDefinition();
