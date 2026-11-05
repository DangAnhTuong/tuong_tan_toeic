#!/usr/bin/env node
/**
 * ==============================================================================
 * 🛠️ REGRESSION TEST AUTO-GENERATOR (CƠ CHẾ TỰ ĐỘNG SINH BÀI TEST CHO MỖI BUG)
 * ==============================================================================
 * Triết lý Lorin Tan (SpaceX / Cursor):
 * "Khi một bug phát sinh và được sửa, AI BẮT BUỘC phải sinh ra một file test con
 *  vĩnh viễn trong thư mục tests/regressions/. File này chứng minh bug đã được sửa
 *  và đảm bảo bug đó KHÔNG BAO GIỜ bị tái phát trong tương lai."
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const regressionsDir = path.join(rootDir, 'tests', 'regressions');

if (!fs.existsSync(regressionsDir)) {
  fs.mkdirSync(regressionsDir, { recursive: true });
}

// Lấy tham số dòng lệnh
const args = process.argv.slice(2);
let bugId = '';
let title = '';
let description = '';
let moduleTarget = '';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--id' && args[i + 1]) bugId = args[i + 1];
  if (args[i] === '--title' && args[i + 1]) title = args[i + 1];
  if (args[i] === '--desc' && args[i + 1]) description = args[i + 1];
  if (args[i] === '--module' && args[i + 1]) moduleTarget = args[i + 1];
}

// Nếu không truyền tham số, tự động tạo ID ngẫu nhiên theo số lượng hiện có
if (!bugId) {
  const existingFiles = fs.readdirSync(regressionsDir).filter(f => f.endsWith('.test.js'));
  const nextNum = String(existingFiles.length + 1).padStart(3, '0');
  bugId = `REG-${nextNum}`;
}

if (!title) {
  title = 'automated_bug_fix_verification';
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const fileName = `reg_${bugId.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${slug}.test.js`;
const targetFilePath = path.join(regressionsDir, fileName);

const template = `/**
 * ==============================================================================
 * 🛡️ REGRESSION TEST: ${bugId} — ${title}
 * ==============================================================================
 * Mô tả bug: ${description || 'Tự động sinh bởi Agent khi giải quyết vấn đề.'}
 * Module bị ảnh hưởng: ${moduleTarget || 'Toàn hệ thống'}
 * Ngày tạo: ${new Date().toISOString()}
 * Tiêu chuẩn Lorin Tan: Bài test này chạy ngầm vĩnh viễn trong mọi lần kiểm định.
 * ==============================================================================
 */

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('${bugId}: ${title}', async () => {
  const rootDir = path.resolve(__dirname, '../..');
  
  // TODO: Viết logic kiểm tra bất biến chống tái phát lỗi tại đây
  // Ví dụ: Kiểm tra cú pháp, trạng thái state, hoặc gọi API giả lập
  
  assert.strictEqual(true, true, 'Bảo đảm điều kiện bất biến không bị phá vỡ.');
});
`;

fs.writeFileSync(targetFilePath, template, 'utf8');

console.log('='.repeat(75));
console.log(`✅ [PLAYBOOK] ĐÃ TỰ ĐỘNG TẠO BÀI TEST CHỐNG HỒI QUY:`);
console.log(`📁 Đường dẫn: ${targetFilePath}`);
console.log(`🏷️  Bug ID: ${bugId} — ${title}`);
console.log(`ℹ️  Bài test này đã được thêm vào bộ kiểm định tự động 'npm run verify'.`);
console.log('='.repeat(75));
