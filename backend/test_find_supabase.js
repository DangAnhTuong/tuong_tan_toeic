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
  const html = await fetchUrl('https://dautoeic.com');
  const assets = html.match(/\/assets\/[a-zA-Z0-9_\-\.]+\.js/g) || [];
  console.log('Found assets:', assets);

  for (const asset of assets) {
    const js = await fetchUrl(`https://dautoeic.com${asset}`);
    const supabaseUrl = js.match(/https:\/\/[a-z0-9]+\.supabase\.co/g);
    const anonKey = js.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_\-]+/g);
    if (supabaseUrl || anonKey) {
      console.log('Found in', asset, ':', { supabaseUrl, anonKey: anonKey ? anonKey[0].substring(0, 30) + '...' : null });
    }
  }
}

main().catch(console.error);
