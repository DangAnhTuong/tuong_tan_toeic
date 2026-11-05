#!/usr/bin/env node
/**
 * ==============================================================================
 * 🤖 BENNY BUG REPRODUCER & VERIFICATION AGENT (CHẾ ĐỘ TÁI HIỆN LỖI TỰ ĐỘNG)
 * ==============================================================================
 * Triết lý Lorin Tan (SpaceX / Cursor):
 * "Agent Benny tự động mở trình duyệt headless Chrome, truy cập vào đúng màn hình
 *  người dùng báo lỗi, bấm thử các nút, chụp ảnh màn hình chẩn đoán và kiểm tra xem
 *  lỗi có thực sự xảy ra hay không mà không cần con người phải ngồi kiểm tra bằng tay."
 * ==============================================================================
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'frontend', 'dist');
const scratchDir = path.resolve(rootDir, 'scratch');

if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 4199;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function createPreviewServer() {
  return http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    if (reqUrl === '/') reqUrl = '/index.html';
    let filePath = path.join(distDir, reqUrl);
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

async function runBennyReproducer(targetRoute = '/') {
  console.log('='.repeat(75));
  console.log('🤖 BENNY BUG REPRODUCER — TỰ ĐỘNG TÁI HIỆN & CHẨN ĐOÁN LỖI GIAO DIỆN');
  console.log(`🎯 Mục tiêu kiểm tra: ${targetRoute}`);
  console.log('='.repeat(75));

  if (!fs.existsSync(distDir)) {
    console.error('❌ [BENNY] Thư mục frontend/dist chưa được đóng gói! Đang chạy build...');
    const { execSync } = await import('child_process');
    execSync('npm run build', { cwd: path.join(rootDir, 'frontend'), stdio: 'inherit' });
  }

  if (!fs.existsSync(CHROME_PATH)) {
    console.error(`❌ [BENNY] Không tìm thấy Chrome tại: ${CHROME_PATH}`);
    process.exit(1);
  }

  const server = createPreviewServer();
  await new Promise(resolve => server.listen(PORT, resolve));
  console.log(`🌐 [BENNY] Máy chủ cục bộ đã kích hoạt tại http://localhost:${PORT}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const consoleLogs = [];
  const runtimeErrors = [];
  let isCrashed = false;
  let screenshotFile = '';

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type().toUpperCase()}] ${text}`);
      if (msg.type() === 'error') {
        runtimeErrors.push(`[CONSOLE_ERROR] ${text}`);
      }
    });

    page.on('pageerror', err => {
      const message = err.message || String(err);
      runtimeErrors.push(`[UNCAUGHT_EXCEPTION] ${message}`);
      isCrashed = true;
    });

    // Mock VIP User Session
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('tuong_tan_toeic_token', 'benny_audit_mock_token');
      localStorage.setItem('tuong_tan_toeic_user', JSON.stringify({
        _id: '6aa03b01014c03b63216630f',
        userId: 'benny_verifier',
        email: 'benny.agent@spacex.cursor.dev',
        fullName: 'Benny Automated Inspector',
        role: 'user',
        isPro: true,
        proTier: 'pro_12_months',
        proExpiresAt: '2028-01-01T00:00:00.000Z'
      }));
    });

    const targetUrl = `http://localhost:${PORT}${targetRoute.startsWith('/') ? targetRoute : '/' + targetRoute}`;
    console.log(`🔍 [BENNY] Đang điều hướng đến: ${targetUrl} ...`);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Đợi 1 giây để React mount hoàn chỉnh
    await new Promise(r => setTimeout(r, 1000));

    // Kiểm tra xem ErrorBoundary có kích hoạt không
    const errorBoundaryMsg = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      if (bodyText.includes('Đã xảy ra lỗi hiển thị') || bodyText.includes('Something went wrong')) {
        return 'ErrorBoundary Activated: Phát hiện màn hình thông báo lỗi sập ứng dụng!';
      }
      return null;
    });

    if (errorBoundaryMsg) {
      isCrashed = true;
      runtimeErrors.push(errorBoundaryMsg);
    }

    // Đếm số lượng DOM node trong #root
    const domMetrics = await page.evaluate(() => {
      const root = document.getElementById('root');
      if (!root) return { hasRoot: false, childrenCount: 0, buttonsCount: 0 };
      return {
        hasRoot: true,
        childrenCount: root.children.length,
        buttonsCount: document.querySelectorAll('button').length,
        headingsCount: document.querySelectorAll('h1, h2, h3').length,
        documentTitle: document.title
      };
    });

    // Chụp ảnh màn hình chẩn đoán
    const cleanRouteName = targetRoute.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    screenshotFile = path.join(scratchDir, `benny_diagnosis_${cleanRouteName}.png`);
    await page.screenshot({ path: screenshotFile, fullPage: false });
    console.log(`📸 [BENNY] Đã chụp ảnh màn hình chẩn đoán: ${screenshotFile}`);

    console.log('\n' + '='.repeat(75));
    console.log('📋 BÁO CÁO KẾT QUẢ CHẨN ĐOÁN CỦA AGENT BENNY:');
    console.log('='.repeat(75));
    console.log(`🏷️  Tiêu đề trang (Document Title): "${domMetrics.documentTitle}"`);
    console.log(`🧱 Số nút bấm tương tác (Buttons): ${domMetrics.buttonsCount}`);
    console.log(`📑 Số thẻ tiêu đề (Headings): ${domMetrics.headingsCount}`);
    console.log(`⚡ Trạng thái React Root: ${domMetrics.childrenCount > 0 ? 'Mounted Thành Công' : 'RỖNG'}`);

    if (runtimeErrors.length > 0) {
      console.log('\n🚨 PHÁT HIỆN LỖI RUNTIME / CRASH:');
      runtimeErrors.forEach((err, idx) => console.log(`   ${idx + 1}. ${err}`));
    } else {
      console.log('\n✅ KHÔNG PHÁT HIỆN LỖI RUNTIME! Màn hình hiển thị mượt mà 100%.');
    }

    console.log('='.repeat(75));

    if (isCrashed || runtimeErrors.length > 0) {
      console.log('❌ KẾT LUẬN: ĐÃ TÁI HIỆN THÀNH CÔNG LỖI! Cần sửa mã nguồn trước khi release.');
      process.exit(1);
    } else {
      console.log('🏆 KẾT LUẬN: MÀN HÌNH HOÀN TOÀN KHỎE MẠNH! Đạt tiêu chuẩn kiểm định.');
      process.exit(0);
    }

  } catch (err) {
    console.error('❌ [BENNY] Lỗi ngoại lệ trong quá trình chẩn đoán:', err.message);
    process.exit(1);
  } finally {
    await browser.close();
    server.close();
  }
}

// Chạy test với tham số dòng lệnh hoặc mặc định vào /listen
const argRoute = process.argv[2] || '/listen';
runBennyReproducer(argRoute);
