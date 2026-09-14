const https = require('https');

function ping(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 4000 }, (res) => resolve(res.statusCode))
      .on('error', () => resolve(null))
      .on('timeout', () => resolve(null));
  });
}

async function discover() {
  const base = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023';
  const tests = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const results = await Promise.all(tests.map(async (t) => {
    const pad = t < 10 ? `0${t}` : `${t}`;
    const patterns = [
      `TEST_${t}`, `TEST_${pad}`,
      `Test ${t}`, `Test ${pad}`,
      `Test_${t}`, `Test_${pad}`,
      `test${t}`, `test${pad}`,
      `t${t}`, `t${pad}`
    ];
    
    let found = [];
    for (const p of patterns) {
      const code = await ping(`${base}/${encodeURIComponent(p)}/1.mp3`);
      if (code === 200) found.push(p);
    }
    return { test: t, found };
  }));

  results.forEach(r => console.log(`Test ${r.test}: ${r.found.join(', ') || 'NONE'}`));
  process.exit(0);
}

discover();
