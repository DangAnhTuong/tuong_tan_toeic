const https = require('https');

function ping(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 3000 }, (res) => resolve({ url, status: res.statusCode }))
      .on('error', () => resolve({ url, status: null }))
      .on('timeout', () => resolve({ url, status: null }));
  });
}

async function findFiles() {
  const base = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test%2007';
  
  const tests = [];
  for (let i = 1; i <= 100; i++) {
    tests.push(`${i}.mp3`);
    if (i >= 31 && i <= 70 && (i - 32) % 3 === 0) {
      tests.push(`${i}-${i+2}.mp3`);
    }
    if (i >= 71 && (i - 71) % 3 === 0) {
      tests.push(`${i}-${i+2}.mp3`);
    }
  }

  const results = await Promise.all(tests.map(async (f) => {
    const res = await ping(`${base}/${encodeURIComponent(f)}`);
    return { file: f, status: res.status };
  }));

  const found = results.filter(r => r.status === 200);
  console.log('Total files found in 2023/Test 07:', found.length);
  console.log(found.map(f => f.file).join(', '));
  process.exit(0);
}

findFiles();
