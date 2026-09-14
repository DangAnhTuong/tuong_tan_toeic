const https = require('https');

function ping(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => resolve(res.statusCode)).on('error', () => resolve('error'));
  });
}

async function discover2023Folders() {
  const base = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023';
  
  for (let t = 1; t <= 10; t++) {
    const pad = t < 10 ? `0${t}` : `${t}`;
    const patterns = [
      `TEST_${t}`,
      `TEST_${pad}`,
      `Test ${t}`,
      `Test ${pad}`,
      `Test_${t}`,
      `Test_${pad}`,
      `test${t}`,
      `test${pad}`,
      `t${t}`,
      `t${pad}`
    ];

    let found = [];
    for (const p of patterns) {
      // test 1.mp3 or 71-73.mp3
      const encoded = encodeURIComponent(p);
      const url1 = `${base}/${encoded}/1.mp3`;
      const s1 = await ping(url1);
      if (s1 === 200) {
        found.push({ pattern: p, file: '1.mp3', status: s1 });
      }
    }
    console.log(`Test ${t}:`, found.length ? found.map(f => f.pattern).join(', ') : 'NOT FOUND with 1.mp3');
  }
  process.exit(0);
}

discover2023Folders();
