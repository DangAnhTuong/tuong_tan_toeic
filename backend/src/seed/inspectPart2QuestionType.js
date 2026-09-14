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

async function inspectPart2QuestionType() {
  const js = await getPage('https://dautoeic.com/assets/part2QuestionType-DTP9Xd98.js');
  console.log('File length:', js.length);
  console.log(js.slice(0, 3500));
}

inspectPart2QuestionType();
