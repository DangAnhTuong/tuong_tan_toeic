const https = require('https');

function testMyMemory(text) {
  return new Promise((resolve, reject) => {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|vi`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.responseData.translatedText);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing MyMemory API...');
  const res1 = await testMyMemory('She is a member of the garden society.');
  console.log('Sample 1:', res1);

  const res2 = await testMyMemory('She bought her tickets in time for a discount.');
  console.log('Sample 2:', res2);

  const res3 = await testMyMemory('What is suggested about Ms. Adeyemi?');
  console.log('Sample 3:', res3);

  process.exit(0);
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
