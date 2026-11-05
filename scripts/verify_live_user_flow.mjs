import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const scratchDir = path.resolve('scratch');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => {
    errors.push(err.message);
  });

  // 1. Check Listening Dashboard Part 1
  console.log('1. Checking https://toeic.danganhtuong.dev/listen?part=1 ...');
  await page.goto('https://toeic.danganhtuong.dev/listen?part=1', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(scratchDir, 'verify_live_dashboard_part1.png'), fullPage: true });
  console.log('Saved scratch/verify_live_dashboard_part1.png');

  // Check 8 levels
  const levelText = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasLevel1: text.includes('Level 1'),
      hasLevel8: text.includes('Level 8'),
      hasDauVat: text.includes('Tranh tả vật'),
      hasTheoDangTranh: text.includes('Theo dạng tranh'),
      allTextSnippet: text.slice(0, 500)
    };
  });
  console.log('Dashboard Part 1 evaluation:', levelText);

  // 2. Check Part 1 Topic "Tranh tả vật"
  console.log('\n2. Checking https://toeic.danganhtuong.dev/listen/level-practice?part=1&mode=topic&topic=Tranh%20t%E1%BA%A3%20v%E1%BA%ADt ...');
  await page.goto('https://toeic.danganhtuong.dev/listen/level-practice?part=1&mode=topic&topic=Tranh%20t%E1%BA%A3%20v%E1%BA%ADt', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: path.join(scratchDir, 'verify_live_topic_tranh_ta_vat.png'), fullPage: true });
  console.log('Saved scratch/verify_live_topic_tranh_ta_vat.png');

  const topicEvaluation = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasErrorBox: text.includes('Không thể tải bài tập') || text.includes('Không tìm thấy câu hỏi bài tập'),
      hasQuestions: text.includes('Câu 1') || text.includes('Select the') || text.includes('statements'),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean).slice(0, 10),
      images: Array.from(document.querySelectorAll('img')).map(img => img.src).slice(0, 5)
    };
  });
  console.log('Topic Practice Room evaluation:', topicEvaluation);

  // 3. Check Dictation page
  console.log('\n3. Checking https://toeic.danganhtuong.dev/listen?mode=dictation&year=crack1 ...');
  await page.goto('https://toeic.danganhtuong.dev/listen?mode=dictation&year=crack1', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: path.join(scratchDir, 'verify_live_dictation_crack1.png'), fullPage: true });
  console.log('Saved scratch/verify_live_dictation_crack1.png');

  const dictationEvaluation = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasCrack1: text.includes('Crack Vol 1'),
      hasTest1: text.includes('Test 1'),
      has24Cau: text.includes('24 câu')
    };
  });
  console.log('Dictation Crack 1 evaluation:', dictationEvaluation);

  console.log('\nConsole Errors during session:', errors);

  await browser.close();
  console.log('\n✅ Verification Completed!');
}

verify().catch(console.error);

