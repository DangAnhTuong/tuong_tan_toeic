const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function inspect() {
  const url = 'https://dautoeic.com/listening/0ccf441a-d1b0-40e0-8ec7-77db0667ccaf/4ecf7d78-4b27-4ee9-b8e0-1da6a07bc1ca';
  const html = await fetchUrl(url);
  console.log('HTML length:', html.length);

  const scriptMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    const data = JSON.parse(scriptMatch[1]);
    console.log('Page Props keys:', Object.keys(data.props?.pageProps || {}));
    const pageProps = data.props?.pageProps || {};
    
    // Print structure of lesson / sentences / audio
    console.log('\n--- PAGE PROPS SUMMARY ---');
    console.log(JSON.stringify(pageProps, null, 2).slice(0, 3000));
  } else {
    console.log('Searching for other script tags...');
    const allScripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
    console.log('Found script tags:', allScripts.length);
  }
}

inspect().catch(console.error);
