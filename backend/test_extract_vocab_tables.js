const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

async function main() {
  const js = await fetchUrl('https://dautoeic.com/assets/index-D5khxD_C.js');
  const anonKeyMatch = js.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_\-\.]+/);
  const anonKey = anonKeyMatch ? anonKeyMatch[0] : null;
  console.log('Anon Key:', anonKey);

  // Search for table names related to vocabulary
  const tables = js.match(/from\(["']([a-zA-Z0-9_]+)["']\)/g);
  console.log('Unique Supabase tables mentioned in JS:', [...new Set(tables)]);

  // Let's also search for vocabulary queries in the JS
  const vocabMatches = js.match(/[a-zA-Z0-9_]*(vocab|word|topic|flashcard|deck)[a-zA-Z0-9_]*/gi);
  console.log('Vocab related terms:', [...new Set(vocabMatches)].slice(0, 30));
}

main().catch(console.error);
