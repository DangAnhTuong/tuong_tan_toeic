import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const scratchDir = path.resolve('scratch');

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Set mock VIP user
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('tuong_tan_toeic_token', 'mock_verified_token');
    localStorage.setItem('tuong_tan_toeic_user', JSON.stringify({
      _id: '6aa03b01014c03b63216630f',
      userId: 'tuongtan_vip_tester',
      email: 'tester@danganhtuong.dev',
      fullName: 'VIP User',
      role: 'admin',
      isPro: true,
      proTier: 'pro_12_months'
    }));
  });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  console.log('Testing authenticated access to Tranh tả vật...');
  await page.goto('https://toeic.danganhtuong.dev/listen/level-practice?part=1&mode=topic&topic=Tranh%20t%E1%BA%A3%20v%E1%BA%ADt', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 4000));

  await page.screenshot({ path: path.join(scratchDir, 'verify_authenticated_tranh_ta_vat.png'), fullPage: true });
  console.log('Saved scratch/verify_authenticated_tranh_ta_vat.png');

  const topicEvaluation = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasErrorBox: text.includes('Không thể tải bài tập') || text.includes('Không tìm thấy câu hỏi bài tập'),
      hasQuestion: text.includes('Câu 1') || text.includes('Câu 1/') || text.includes('1/131'),
      totalCountText: document.querySelector('.font-mono')?.innerText || 'none',
      prompt: document.querySelector('h2, h3, p')?.innerText || 'none',
      imageSrc: document.querySelector('img')?.src || 'no-image',
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean).slice(0, 10),
      textSnippet: text.slice(0, 400)
    };
  });
  console.log('Topic Practice Room with Auth:', topicEvaluation);
  console.log('Console Errors:', errors);

  await browser.close();
}

verify().catch(console.error);

