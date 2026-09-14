const https = require('https');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const chunksToFetch = [
  'assets/useSimpleSRS-CmrC5YYo.js',
  'assets/VocabularyLearnPage-whxgwV4G.js',
  'assets/VocabularyLearnTab-BQQddYO-.js',
  'assets/VocabularyReviewPage-DpMIB-d1.js',
  'assets/VocabBasketWordItem-C1S1EINB.js',
  'assets/useDueWordsAllMine-DZXVIuqJ.js',
  'assets/useUpcomingWords-PwWsTiip.js',
  'assets/useDifficultWords-dMlSlptM.js'
];

async function main() {
  for (const chunk of chunksToFetch) {
    const filename = path.basename(chunk);
    try {
      const content = await get(`https://dautoeic.com/${chunk}`);
      fs.writeFileSync(path.join(__dirname, filename), content, 'utf8');
      console.log(`Saved ${filename} (${content.length} bytes)`);
    } catch (e) {
      console.error(`Failed ${chunk}:`, e.message);
    }
  }
}

main().catch(console.error);
