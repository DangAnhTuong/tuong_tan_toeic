const https = require('https');

function getPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function findAnonKey() {
  try {
    const html = await getPage('https://dautoeic.com');
    const regex = /https:\/\/qfhmnlvgweznzcsoijyr\.supabase\.co/g;
    console.log('Found supabase url in html:', regex.test(html));

    // Find JS files
    const jsMatches = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
    console.log('JS files:', jsMatches);

    for (const src of jsMatches) {
      const fullUrl = src.startsWith('http') ? src : `https://dautoeic.com${src.startsWith('/') ? '' : '/'}${src}`;
      console.log('Checking:', fullUrl);
      const jsContent = await getPage(fullUrl);
      const anonMatch = jsContent.match(/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g);
      if (anonMatch) {
        console.log('FOUND ANON KEY:', anonMatch[0]);
        return anonMatch[0];
      }
    }
  } catch (err) {
    console.error('Error finding anon key:', err.message);
  }
}

findAnonKey();
