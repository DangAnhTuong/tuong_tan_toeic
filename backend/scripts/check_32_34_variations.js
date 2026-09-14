const https = require('https');

const base = 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2023/Test%2007';

const candidates = [
  '32.mp3', '33.mp3', '34.mp3',
  '32_34.mp3', '32-34.MP3', '32 - 34.mp3', '32-34 .mp3', ' 32-34.mp3',
  '32 to 34.mp3', 'part3_32-34.mp3', 'Part3_32-34.mp3',
  'audio_32-34.mp3', '31-34.mp3', '31-33.mp3', '32-35.mp3'
];

async function check() {
  for (const c of candidates) {
    const code = await new Promise(r => {
      https.get(`${base}/${encodeURIComponent(c)}`, res => r(res.statusCode)).on('error', () => r(null));
    });
    if (code === 200) console.log('FOUND:', c);
  }
  console.log('Done checking candidates');
  process.exit(0);
}
check();
