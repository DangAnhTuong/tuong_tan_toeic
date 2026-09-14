import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4188;

// MIME types dictionary for static server
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// 1. Create Lightweight SPA Static Server
function createServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    
    let filePath = path.join(distDir, reqUrl);
    
    // Check if file exists, else fallback to index.html (SPA client routing)
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(distDir, 'index.html');
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    
    try {
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    } catch (err) {
      res.writeHead(500);
      res.end('Server Error: ' + err.message);
    }
  });
}

// 2. Run Headless Smoke Test
async function runSmokeTest() {
  console.log('🧪 [SMOKE_TEST] Starting Headless Pre-Deploy Verification...');
  
  if (!fs.existsSync(distDir)) {
    console.error('❌ [SMOKE_TEST] frontend/dist does not exist! Please run `npm run build` first.');
    process.exit(1);
  }

  if (!fs.existsSync(CHROME_PATH)) {
    console.warn('⚠️ [SMOKE_TEST] Chrome executable not found at standard path. Skipping headless test.');
    process.exit(0);
  }

  const server = createServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`🌐 [SMOKE_TEST] Local preview server running on http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const testRoutes = [
    { name: 'Trang Chủ', path: '/' },
    { name: 'Luyện Nghe', path: '/listen' },
    { name: 'Luyện Nghe Level 4', path: '/listen?tab=level&part=4&year=2026' },
    { name: 'Luyện Đọc', path: '/read' },
    { name: 'Từ Vựng SRS', path: '/vocabulary' },
    { name: 'Đề Thi ETS Full', path: '/tests' }
  ];

  let totalErrors = 0;

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Mock User in LocalStorage (VIP Gold User)
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('tuong_tan_toeic_token', 'mock_jwt_test_token_smoke_test');
      localStorage.setItem('tuong_tan_toeic_user', JSON.stringify({
        _id: '6aa03b01014c03b63216630f',
        userId: 'google_test_user',
        email: 'smoke_tester@toeic.dev',
        fullName: 'Smoke Test VIP',
        role: 'user',
        isPro: true,
        proTier: 'pro_4_months',
        proExpiresAt: '2027-01-12T06:10:46.986Z'
      }));
    });

    for (const route of testRoutes) {
      const pageErrors = [];
      const onPageError = err => pageErrors.push(err.message || String(err));
      page.on('pageerror', onPageError);

      const url = `http://localhost:${PORT}${route.path}`;
      process.stdout.write(`   Testing [${route.name}] (${route.path}) ... `);

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        // Give React a small tick to mount and execute effects
        await new Promise(r => setTimeout(r, 600));

        // Check if ErrorBoundary triggered
        const errorBoundaryTriggered = await page.evaluate(() => {
          return document.body.innerText.includes('Đã xảy ra lỗi hiển thị');
        });

        // Check if root has rendered content
        const rootHasChildren = await page.evaluate(() => {
          const root = document.getElementById('root');
          return root && root.children.length > 0;
        });

        if (errorBoundaryTriggered) {
          console.log('❌ FAILED (ErrorBoundary Triggered!)');
          console.error(`      -> Screen crashed into "Đã xảy ra lỗi hiển thị" on ${route.path}`);
          totalErrors++;
        } else if (pageErrors.length > 0) {
          console.log('❌ FAILED (Runtime JS Error)');
          pageErrors.forEach(err => console.error(`      -> Uncaught Error: ${err}`));
          totalErrors++;
        } else if (!rootHasChildren) {
          console.log('❌ FAILED (Empty #root)');
          totalErrors++;
        } else {
          console.log('✅ PASSED (0 Errors)');
        }
      } catch (navErr) {
        console.log(`❌ FAILED (Navigation/Timeout: ${navErr.message})`);
        totalErrors++;
      } finally {
        page.off('pageerror', onPageError);
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  if (totalErrors > 0) {
    console.error(`\n🚨 [SMOKE_TEST] ${totalErrors} CRITICAL ERROR(S) DETECTED! DEPLOYMENT ABORTED!`);
    process.exit(1);
  } else {
    console.log(`\n🎉 [SMOKE_TEST] All ${testRoutes.length} critical routes PASSED with 0 runtime errors! Safe to deploy.\n`);
    process.exit(0);
  }
}

runSmokeTest().catch(err => {
  console.error('Fatal Smoke Test Error:', err);
  process.exit(1);
});
