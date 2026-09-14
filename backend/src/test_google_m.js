const https = require('https');

function translate(text) {
  return new Promise((resolve) => {
    const url = 'https://translate.google.com/m?sl=en&tl=vi&q=' + encodeURIComponent(text);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/<div class="result-container">([\s\S]*?)<\/div>/i);
        if (match) {
          // Decode HTML entities
          const decoded = match[1]
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
          resolve(decoded.trim());
        } else {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

async function test() {
  console.log(await translate('Our company is about to celebrate its tenth anniversary.'));
  console.log(await translate('However, less expensive materials are available.'));
  console.log(await translate('Safety inspections are being conducted.'));
  console.log(await translate('Train a new employee'));
  console.log(await translate('Talk to some directors'));
}
test();
