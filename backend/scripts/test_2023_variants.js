const https = require('https');

async function test2023Variants() {
  const tests = [
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/TEST_1/71-73.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test 01/71-73.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test_01/71-73.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/test_1/71-73.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test 07/32-34.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test_07/32-34.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/test_7/32-34.mp3',
    'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/TEST_7/32-34.mp3'
  ];

  for (const u of tests) {
    await new Promise(r => {
      https.get(u, res => {
        console.log(u.slice(-35), '->', res.statusCode);
        r();
      }).on('error', e => {
        console.log(u.slice(-35), '-> err:', e.message);
        r();
      });
    });
  }
  process.exit(0);
}

test2023Variants().catch(console.error);
