const https = require('https');

function testTranslate(text) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const trans = parsed[0].map(item => item[0]).join('');
          resolve(trans);
        } catch (e) {
          console.error('Raw response snippet:', data.slice(0, 200));
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing Google Translate endpoint with User-Agent...');
  const sample1 = await testTranslate('She is a member of the garden society.');
  console.log('Sample 1: "She is a member of the garden society." =>', sample1);

  const sample2 = await testTranslate('She bought her tickets in time for a discount.');
  console.log('Sample 2: "She bought her tickets in time for a discount." =>', sample2);

  const sample3 = await testTranslate('What is suggested about Ms. Adeyemi?');
  console.log('Sample 3: "What is suggested about Ms. Adeyemi?" =>', sample3);

  const sample4 = await testTranslate('We put a lot of care into crafting the contents.');
  console.log('Sample 4: "We put a lot of care into crafting the contents." =>', sample4);

  process.exit(0);
}

run().catch(e => { console.error('Translation error:', e.message); process.exit(1); });
