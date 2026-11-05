const puppeteer = require('puppeteer-core');

async function testClick() {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
  const page = await browser.newPage();

  console.log('Navigating to https://dauenglish.com/listen/part-1 ...');
  await page.goto('https://dauenglish.com/listen/part-1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Find all cards and their buttons/links
  const cards = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const topicCards = [];
    for (const el of all) {
      if (el.children.length === 0 && (el.innerText === 'Tranh tả vật' || el.innerText === 'Tranh một người')) {
        let parent = el;
        for (let i = 0; i < 5; i++) {
          if (!parent) break;
          const btn = parent.querySelector('button, a');
          if (btn && btn.innerText.includes('Học')) {
            topicCards.push({
              title: el.innerText,
              btnText: btn.innerText,
              btnTag: btn.tagName,
              href: btn.getAttribute('href') || btn.href || null
            });
            break;
          }
          parent = parent.parentElement;
        }
      }
    }
    return topicCards;
  });

  console.log('Detected topic cards:', cards);

  // Intercept requests when clicking
  page.on('request', req => {
    const url = req.url();
    if (url.includes('supabase.co') || url.includes('dauenglish.com')) {
      console.log('REQ:', req.method(), url);
    }
  });

  page.on('response', async res => {
    const url = res.url();
    if (url.includes('question') || url.includes('practice') || url.includes('item') || url.includes('skeleton')) {
      console.log('RES:', res.status(), url);
      try {
        const text = await res.text();
        console.log('RES BODY:', text.slice(0, 500));
      } catch (e) {}
    }
  });

  // Click on the button for "Tranh tả vật"
  console.log('Clicking on Tranh tả vật button...');
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    for (const el of all) {
      if (el.children.length === 0 && el.innerText === 'Tranh tả vật') {
        let parent = el;
        for (let i = 0; i < 6; i++) {
          if (!parent) break;
          const btn = Array.from(parent.querySelectorAll('button, a')).find(b => b.innerText.includes('Học') || b.innerText.includes('Luyện'));
          if (btn) {
            btn.click();
            return;
          }
          parent = parent.parentElement;
        }
      }
    }
  });

  await new Promise(r => setTimeout(r, 4000));
  console.log('New page URL:', page.url());

  await page.close();
}

testClick().catch(console.error);

