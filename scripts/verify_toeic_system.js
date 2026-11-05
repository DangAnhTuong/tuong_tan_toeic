#!/usr/bin/env node
/**
 * ==============================================================================
 * 🤖 BENNY AUTONOMOUS VERIFICATION HARNESS — TƯỜNG TẬN TOEIC (LORIN TAN STANDARD)
 * ==============================================================================
 * Căn cứ 100% vào bài giảng của Kỹ sư AI Lorin Tan (SpaceX / Cursor):
 * 1. Tự động kiểm tra cú pháp, đơn vị logic và hàng rào cứng.
 * 2. Tự động mở trình duyệt Headless Chrome như một người dùng thật để kiểm tra giao diện.
 * 3. Báo cáo bảng điểm Rubric Scorecard (100 PTS) trước khi cho phép commit hay nộp bài.
 * ==============================================================================
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 7-Checkpoint Rubric Scorecard
const rubrics = [
  { id: 'R1', name: 'Agent Hard Guardrails & Domain Invariants (AST/Regex)', weight: 15, status: 'PENDING', message: '' },
  { id: 'R2', name: 'Core Business Logic Unit Tests (TOEIC Score, SM-2, Invariants)', weight: 15, status: 'PENDING', message: '' },
  { id: 'R3', name: 'Backend Controllers Syntax & Export Integrity (21 Files)', weight: 15, status: 'PENDING', message: '' },
  { id: 'R4', name: 'Backend Models Syntax & Schema Integrity (19 Files)', weight: 15, status: 'PENDING', message: '' },
  { id: 'R5', name: 'Frontend Critical Imports & Cross-References (84 Files)', weight: 15, status: 'PENDING', message: '' },
  { id: 'R6', name: 'Media CDN & Self-Hosted Zero-Supabase Audit', weight: 10, status: 'PENDING', message: '' },
  { id: 'R7', name: 'Headless Chrome Browser Live Verification (7 Critical Routes)', weight: 15, status: 'PENDING', message: '' }
];

console.log('='.repeat(78));
console.log('🤖 BENNY AUTONOMOUS VERIFICATION HARNESS — TƯỜNG TẬN TOEIC');
console.log(`⏰ Khởi chạy: ${new Date().toISOString()}`);
console.log(`📁 Thư mục gốc: ${rootDir}`);
console.log('='.repeat(78));

let totalScore = 0;
let hasFailure = false;

// ------------------------------------------------------------------------------
// CHECK 1: Hard Guardrails
// ------------------------------------------------------------------------------
process.stdout.write('\n[R1] Đang quét Hard Guardrails AST & Invariants... ');
try {
  const guardrailPath = path.join(rootDir, '.agent_guardrails', 'guardrail_check.js');
  execSync(`node "${guardrailPath}"`, { stdio: 'pipe', cwd: rootDir });
  rubrics[0].status = 'PASS';
  rubrics[0].message = '100% Guardrails & Invariants tuân thủ nghiêm ngặt.';
  totalScore += rubrics[0].weight;
  console.log(`✅ PASS (${rubrics[0].weight}/${rubrics[0].weight} pts)`);
} catch (err) {
  rubrics[0].status = 'FAIL';
  rubrics[0].message = err.stdout?.toString() || err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// CHECK 2: Core Business Logic & Regression Unit Tests
// ------------------------------------------------------------------------------
process.stdout.write('[R2] Đang chạy Unit Tests & Regression Tests chống hồi quy... ');
try {
  const testsDir = path.join(rootDir, 'tests');
  const regDir = path.join(testsDir, 'regressions');
  let testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.test.js')).map(f => path.join(testsDir, f));
  if (fs.existsSync(regDir)) {
    const regFiles = fs.readdirSync(regDir).filter(f => f.endsWith('.test.js')).map(f => path.join(regDir, f));
    testFiles = testFiles.concat(regFiles);
  }
  const quotedFiles = testFiles.map(f => `"${f}"`).join(' ');
  execSync(`node --test ${quotedFiles}`, { stdio: 'pipe', cwd: rootDir });
  rubrics[1].status = 'PASS';
  rubrics[1].message = `Toàn bộ ${testFiles.length} file test suite (Core Logic + Regressions) đã vượt qua 100%.`;
  totalScore += rubrics[1].weight;
  console.log(`✅ PASS (${testFiles.length} test files - ${rubrics[1].weight}/${rubrics[1].weight} pts)`);
} catch (err) {
  rubrics[1].status = 'FAIL';
  rubrics[1].message = err.stdout?.toString() || err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// CHECK 3: Backend Controllers Syntax
// ------------------------------------------------------------------------------
process.stdout.write('[R3] Đang kiểm tra cú pháp 21 Backend Controllers... ');
try {
  const controllersDir = path.join(rootDir, 'backend', 'src', 'controllers');
  const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    execSync(`node -c "${path.join(controllersDir, file)}"`, { stdio: 'pipe' });
  }
  rubrics[2].status = 'PASS';
  rubrics[2].message = `Toàn bộ ${files.length} controllers hợp lệ về cú pháp Node.js.`;
  totalScore += rubrics[2].weight;
  console.log(`✅ PASS (${files.length}/${files.length} controllers - ${rubrics[2].weight}/${rubrics[2].weight} pts)`);
} catch (err) {
  rubrics[2].status = 'FAIL';
  rubrics[2].message = err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// CHECK 4: Backend Models Syntax
// ------------------------------------------------------------------------------
process.stdout.write('[R4] Đang kiểm tra cú pháp 19 Mongoose Models... ');
try {
  const modelsDir = path.join(rootDir, 'backend', 'src', 'models');
  const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js'));
  for (const file of files) {
    execSync(`node -c "${path.join(modelsDir, file)}"`, { stdio: 'pipe' });
  }
  rubrics[3].status = 'PASS';
  rubrics[3].message = `Toàn bộ ${files.length} models hợp lệ về cú pháp Node.js.`;
  totalScore += rubrics[3].weight;
  console.log(`✅ PASS (${files.length}/${files.length} models - ${rubrics[3].weight}/${rubrics[3].weight} pts)`);
} catch (err) {
  rubrics[3].status = 'FAIL';
  rubrics[3].message = err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// CHECK 5: Frontend Critical Imports
// ------------------------------------------------------------------------------
process.stdout.write('[R5] Đang kiểm tra tính toàn vẹn Frontend Critical Imports... ');
try {
  const validatorScript = path.join(rootDir, 'frontend', 'scripts', 'validateImports.js');
  execSync(`node "${validatorScript}"`, { stdio: 'pipe', cwd: rootDir });
  rubrics[4].status = 'PASS';
  rubrics[4].message = 'Tất cả 84 frontend files vượt qua kiểm tra Critical Imports.';
  totalScore += rubrics[4].weight;
  console.log(`✅ PASS (${rubrics[4].weight}/${rubrics[4].weight} pts)`);
} catch (err) {
  rubrics[4].status = 'FAIL';
  rubrics[4].message = err.stdout?.toString() || err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// CHECK 6: Media CDN & Zero Supabase Audit
// ------------------------------------------------------------------------------
process.stdout.write('[R6] Đang quét rà soát Zero Supabase Storage trong Codebase... ');
try {
  const pagesDir = path.join(rootDir, 'frontend', 'src', 'pages');
  const pageFiles = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));
  let foundSupabase = false;
  let culprit = '';
  for (const f of pageFiles) {
    const content = fs.readFileSync(path.join(pagesDir, f), 'utf8');
    if (/supabase\.co\/storage/i.test(content)) {
      foundSupabase = true;
      culprit = `frontend/src/pages/${f}`;
      break;
    }
  }
  if (foundSupabase) throw new Error(`Phát hiện Supabase link tại ${culprit}`);
  rubrics[5].status = 'PASS';
  rubrics[5].message = '100% trang giao diện đã thoát ly hoàn toàn khỏi Supabase Storage.';
  totalScore += rubrics[5].weight;
  console.log(`✅ PASS (${rubrics[5].weight}/${rubrics[5].weight} pts)`);
} catch (err) {
  rubrics[5].status = 'FAIL';
  rubrics[5].message = err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// CHECK 7: Real Headless Chrome Browser Verification (Puppeteer)
// ------------------------------------------------------------------------------
process.stdout.write('[R7] Đang khởi chạy Headless Chrome kiểm thử giao diện thực tế (7 routes)... ');
try {
  const smokeScript = path.join(rootDir, 'frontend', 'scripts', 'smokeTestHeadless.js');
  execSync(`node "${smokeScript}"`, { stdio: 'pipe', cwd: rootDir });
  rubrics[6].status = 'PASS';
  rubrics[6].message = 'Chrome Headless đã duyệt 7 màn hình cốt lõi, 0 crash, 0 ErrorBoundary.';
  totalScore += rubrics[6].weight;
  console.log(`✅ PASS (${rubrics[6].weight}/${rubrics[6].weight} pts)`);
} catch (err) {
  rubrics[6].status = 'FAIL';
  rubrics[6].message = err.stdout?.toString() || err.message;
  hasFailure = true;
  console.log('❌ FAIL (0 pts)');
}

// ------------------------------------------------------------------------------
// BÁO CÁO TỔNG HỢP BENNY SCORECARD
// ------------------------------------------------------------------------------
console.log('\n' + '='.repeat(78));
console.log('📋 BENNY VERIFICATION SCORECARD — KẾT QUẢ ĐÁNH GIÁ TOÀN DIỆN');
console.log('='.repeat(78));

rubrics.forEach(r => {
  const badge = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  console.log(`[${r.id}] ${badge} (${r.weight} pts) - ${r.name}`);
  console.log(`     Chi tiết: ${r.message}`);
});

console.log('-'.repeat(78));
console.log(`🎯 TỔNG ĐIỂM HỆ THỐNG: ${totalScore}/100 PTS`);

if (hasFailure || totalScore < 100) {
  console.log('❌ TRẠNG THÁI: CHƯA ĐẠT CHUẨN 100%. Vui lòng sửa các lỗi trên trước khi bàn giao!');
  console.log('='.repeat(78));
  process.exit(1);
} else {
  console.log('🏆 TRẠNG THÁI: 100% ĐẠT CHUẨN LORIN TAN (SPACEX / CURSOR)! SẴN SÀNG COMMIT / DEPLOY!');
  console.log('='.repeat(78));
  process.exit(0);
}
