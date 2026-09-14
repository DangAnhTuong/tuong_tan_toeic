const https = require('https');

async function testAll2023() {
  for (let i = 1; i <= 10; i++) {
    const pad = i < 10 ? '0' + i : '' + i;
    const variants = [
      `2023/Test ${pad}`,
      `2023/TEST_${i}`,
      `2023/Test ${i}`,
      `2023/Test_${pad}`
    ];
    for (const v of variants) {
      const u = `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/${v}/32-34.mp3`;
      const ok = await new Promise(r => {
        https.get(u, res => r(res.statusCode === 200)).on('error', () => r(false));
      });
      if (ok) {
        console.log(`Test ${i} 2023 -> MATCH: "${v}"`);
        break;
      }
    }
  }
  process.exit(0);
}

testAll2023().catch(console.error);
