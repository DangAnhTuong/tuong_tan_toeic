/**
 * ==============================================================================
 * 🛡️ REGRESSION TEST: REG-012 — Tra Tu & 2-Way Speech Translation System
 * ==============================================================================
 * Bối cảnh: Học viên và Thầy kiểm tra tính năng tra từ, dịch 2 chiều Anh ⇄ Việt,
 * thu âm giọng nói tiếng Việt qua Micro và đọc to tiếng Anh bằng giọng bản xứ.
 * Tiêu chuẩn Lorin Tan: Đảm bảo tính năng dịch thuật 0đ và Voice Web Speech hoạt động vĩnh viễn.
 * ==============================================================================
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('REG-012: Tra Tu & 2-Way Translation Architecture Coherence', () => {
  const rootDir = path.resolve(__dirname, '../..');

  // 1. Verify TraTuPage exists
  const traTuPagePath = path.join(rootDir, 'frontend/src/pages/TraTuPage.jsx');
  assert.ok(fs.existsSync(traTuPagePath), 'TraTuPage.jsx must exist in frontend/src/pages/');

  const traTuContent = fs.readFileSync(traTuPagePath, 'utf8');
  assert.ok(traTuContent.includes('SpeechRecognition'), 'TraTuPage must support Web Speech API for voice mic input');
  assert.ok(traTuContent.includes('speechSynthesis'), 'TraTuPage must support Web SpeechSynthesis for audio speaker');
  assert.ok(traTuContent.includes('handleSwapLanguages'), 'TraTuPage must support 2-way language swap (VI <-> EN)');

  // 2. Verify App.jsx has /tra-tu route
  const appPath = path.join(rootDir, 'frontend/src/App.jsx');
  const appContent = fs.readFileSync(appPath, 'utf8');
  assert.ok(appContent.includes('/tra-tu'), 'App.jsx must register /tra-tu route');
  assert.ok(appContent.includes('TraTuPage'), 'App.jsx must import TraTuPage');

  // 3. Verify Navbar has Tra Tu link
  const navPath = path.join(rootDir, 'frontend/src/components/Navbar.jsx');
  const navContent = fs.readFileSync(navPath, 'utf8');
  assert.ok(navContent.includes('/tra-tu'), 'Navbar must link to /tra-tu');

  // 4. Verify Backend Translation Controller & Route
  const controllerPath = path.join(rootDir, 'backend/src/controllers/dictionary.controller.js');
  const controllerContent = fs.readFileSync(controllerPath, 'utf8');
  assert.ok(controllerContent.includes('exports.translateText'), 'dictionary.controller.js must export translateText');

  const routesPath = path.join(rootDir, 'backend/src/routes/dictionary.routes.js');
  const routesContent = fs.readFileSync(routesPath, 'utf8');
  assert.ok(routesContent.includes('/translate'), 'dictionary.routes.js must expose /translate route');
});
