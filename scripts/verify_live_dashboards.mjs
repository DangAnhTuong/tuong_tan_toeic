import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const scratchDir = path.resolve('scratch');

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

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

  console.log('Visiting https://toeic.danganhtuong.dev/listen?part=1 ...');
  await page.goto('https://toeic.danganhtuong.dev/listen?part=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(scratchDir, 'verify_live_dashboard_part1_authenticated.png'), fullPage: true });
  console.log('Saved scratch/verify_live_dashboard_part1_authenticated.png');

  // Also visit dictation
  console.log('Visiting https://toeic.danganhtuong.dev/listen?mode=dictation&year=crack1 ...');
  await page.goto('https://toeic.danganhtuong.dev/listen?mode=dictation&year=crack1', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(scratchDir, 'verify_live_dashboard_dictation_authenticated.png'), fullPage: true });
  console.log('Saved scratch/verify_live_dashboard_dictation_authenticated.png');

  await browser.close();
}

test().catch(console.error);

