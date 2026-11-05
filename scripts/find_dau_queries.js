const fs = require('fs');

const files = [
  'scratch/dau_ListeningPracticeLoader.js',
  'scratch/dau_part1PhotoType.js',
  'scratch/dau_ListeningHome.js',
  'scratch/dau_captured_p1_response.json'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const c = fs.readFileSync(f, 'utf8');
    const rpc = c.match(/rpc\(['"][a-zA-Z0-9_-]+['"]/g);
    const from = c.match(/from\(['"][a-zA-Z0-9_-]+['"]/g);
    console.log(f, { rpc: [...new Set(rpc || [])], from: [...new Set(from || [])] });
  }
}

