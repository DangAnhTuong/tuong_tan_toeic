const https = require('https');

async function findTest7() {
  const variants = [
    '2023/Test 7', '2023/Test7', '2023/test7', '2023/test 7', '2023/test-7', '2023/Test-7',
    '2023/Test_7', '2023/test_7', '2023/Test_07', '2023/test_07', '2023/TEST_7', '2023/TEST 7',
    '2023/t7', '2023/T7', '2023/t_7', '2023/test 07', '2023/Test 07'
  ];

  for (const v of variants) {
    const u = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/' + encodeURI(v) + '/32-34.mp3';
    await new Promise(r => {
      https.get(u, res => {
        if (res.statusCode === 200) console.log('FOUND Test 7:', v);
        r();
      }).on('error', () => r());
    });
  }
  process.exit(0);
}

findTest7().catch(console.error);
