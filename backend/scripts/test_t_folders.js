const https = require('https');

async function testTFolders() {
  for (let i = 1; i <= 10; i++) {
    const url = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2026/t' + i + '/32-34.mp3';
    await new Promise(r => {
      https.get(url, res => {
        console.log('2026/t' + i + ': status ' + res.statusCode);
        r();
      }).on('error', err => {
        console.log('2026/t' + i + ': error ' + err.message);
        r();
      });
    });
  }
  process.exit(0);
}

testTFolders().catch(console.error);
