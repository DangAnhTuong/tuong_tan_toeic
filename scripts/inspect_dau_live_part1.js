const puppeteer = require('puppeteer-core');

async function inspectDau() {
  const browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
  const page = await browser.newPage();

  const apis = [];
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('supabase.co') || url.includes('/rpc/') || url.includes('/rest/v1/')) {
      const ct = res.headers()['content-type'] || '';
      if (ct.includes('json')) {
        try {
          const text = await res.text();
          apis.push({ url, status: res.status(), bodyPreview: text.slice(0, 300), length: text.length });
        } catch (e) {}
      }
    }
  });

  console.log('Navigating to https://dauenglish.com/listen/part-1 ...');
  await page.goto('https://dauenglish.com/listen/part-1', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 3000));

  console.log(`Captured ${apis.length} API calls:`);
  for (const a of apis) {
    console.log(`[${a.status}] ${a.url.slice(0, 100)} (len: ${a.length})`);
    if (a.url.includes('unit') || a.url.includes('count') || a.url.includes('level') || a.url.includes('question') || a.url.includes('photo')) {
      console.log('   Preview:', a.bodyPreview);
    }
  }

  // Now click on "Tranh tả vật" or navigate to its practice room!
  console.log('\nClicking on Tranh tả vật on dauenglish.com...');
  // Find link/button for Tranh tả vật
  const topicLink = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, div')).find(e => e.innerText && e.innerText.includes('Tranh tả vật'));
    if (!el) return null;
    const btn = el.closest('div').querySelector('button, a');
    return btn ? (btn.href || btn.innerText) : el.innerText;
  });
  console.log('Found element:', topicLink);

  await page.close();
}

inspectDau().catch(console.error);

