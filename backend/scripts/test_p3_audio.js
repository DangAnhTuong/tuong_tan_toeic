const https = require('https');

const candidates = [
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test%2007/32-34.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test%2007/32.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test%207/32-34.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test%207/32.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/TEST_7/32-34.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/TEST_7/32.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test_07/32-34.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test_07/32.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/t7/32-34.mp3',
  'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/t7/32.mp3',
];

function check(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => resolve({ url, status: 'err: ' + e.message }));
  });
}

async function main() {
  for (const c of candidates) {
    const res = await check(c);
    console.log(`${res.status} <- ${res.url}`);
  }
}
main();
