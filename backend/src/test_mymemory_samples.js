const https = require('https');

function translateMyMemory(text) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|vi';
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          let trans = parsed?.responseData?.translatedText;
          if (trans && parsed?.matches) {
            // Check matches for highest quality
            const goodMatch = parsed.matches.find(m => m.quality && Number(m.quality) >= 70);
            if (goodMatch && goodMatch.translation) trans = goodMatch.translation;
          }
          resolve(trans || text);
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

const samples = [
  "She's closing a garden gate.",
  "She's scrubbing dirt off a fence.",
  "She's bending down to turn on a hose.",
  "She's trimming a hedge.",
  "They're wiping down a work desk.",
  "They're inspecting a printer.",
  "They're filing loose documents in a cabinet.",
  "They're attaching notices to boards.",
  "He's folding a scarf near a counter.",
  "He's reaching for a cap on display."
];

async function run() {
  for (const s of samples) {
    const res = await translateMyMemory(s);
    console.log(s, '===>', res);
  }
}
run();
