#!/usr/bin/env node
/**
 * ==============================================================================
 * 🛡️ TƯỜNG TẬN TOEIC — HARD GUARDRAIL ENGINE (20% PROJECT-SPECIFIC LAYER)
 * ==============================================================================
 * Triết lý Lorin Tan (SpaceX / Cursor):
 * "Thay vì nhắc nhở AI qua prompt, hãy biến mọi luật thành mã code tự động quét.
 *  Nếu vi phạm, hệ thống chặn đứng (Exit 1) và không cho phép commit hay merge code."
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// Cấu hình kiểm duyệt dành riêng cho Tường Tận TOEIC
const CONFIG = {
  maxFileLineLimit: 2500, // Cảnh báo khi file quá dài, khuyến khích tách micro-component
  ignoreDirs: [
    'node_modules', '.git', 'dist', 'build', '.next', 'coverage', 
    'cache', 'temp', 'temp_deploy', 'vendor', 'media', 'logs', 'assets', '.agent_guardrails',
    'agent_starter_kit', 'docs', 'scratch', 'reference_screenshots',
    'cropped_ets_photos', 'cropped_ets_photos_2017', 'cropped_ets_photos_2018',
    'cropped_ets_photos_2019', 'cropped_ets_photos_2020', 'cropped_ets_photos_2021',
    'cropped_ets_photos_2022', 'cropped_ets_photos_2023', 'cropped_ets_photos_2024',
    'cropped_ets_photos_lc2', 'ets_download', 'scribd_download'
  ],
  allowedExtensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
  
  // 1. CÁC CẠM BẪY CHUNG (Universal Footguns)
  bannedPatterns: [
    {
      name: 'Nguy cơ bảo mật: Hàm eval() bị cấm tuyệt đối',
      regex: /\beval\s*\(/,
      severity: 'ERROR'
    },
    {
      name: 'Nguy cơ bảo mật: new Function() sinh code động bị cấm',
      regex: /new\s+Function\s*\(/,
      severity: 'ERROR'
    }
  ],

  // 2. CHẶN BÌNH LUẬN RÁC CỦA AI (Anti-AI Junk Comments)
  aiJunkCommentPatterns: [
    {
      name: 'AI Junk Comment: Mô tả thao tác của AI thừa thãi trong code',
      regex: /\/\/\s*(Here we (added|updated|fixed|implemented)|Added by AI|Per user request|Fix as requested|Modified by agent)/i
    },
    {
      name: 'AI Junk Comment: Ghi chú suy diễn ý định con người',
      regex: /\/\/\s*(DO NOT REMOVE: User said|Never use this again because|Rule added by AI)/i
    }
  ],

  // 3. QUÉT RÒ RỈ SECRETS & PRIVATE KEYS
  secretLeakPatterns: [
    {
      name: 'Rò rỉ Hardcoded Secret Token (JWT / API Key / Bot Token)',
      regex: /(jwt_secret|api_key|bot_token|access_token|private_key)\s*=\s*['"][a-zA-Z0-9_\-]{24,}['"]/i
    },
    {
      name: 'Rò rỉ MongoDB URI chứa mật khẩu trực tiếp',
      regex: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/i
    }
  ],

  // 4. LUẬT BẤT BIẾN TƯỜNG TẬN TOEIC (20% Domain Invariants)
  toeicDomainRules: [
    {
      name: 'Bất biến Media: Cấm nhúng Supabase Storage URL ngoài (Bắt buộc dùng CDN tự host /media/)',
      regex: /https?:\/\/[a-z0-9]+\.supabase\.co\/storage/i,
      severity: 'ERROR',
      fileFilter: (filePath) => !filePath.includes('ipaLessonsData.js') && !filePath.includes('backend\\src\\data') && !filePath.includes('backend/src/data') && !filePath.includes('backend\\src\\seed') && !filePath.includes('backend/src/seed') && !filePath.includes('backend\\scripts') && !filePath.includes('backend/scripts')
    },
    {
      name: 'Bất biến Điều hướng: Cấm gọi navigate(\'/listen\') hoặc navigate(\'/read\') trần làm mất tham số URL trong phòng luyện',
      regex: /navigate\s*\(\s*['"]\/(listen|read)['"]\s*\)/,
      severity: 'ERROR',
      fileFilter: (filePath) => /LevelPracticeRoom|ListeningDictation|ReadingPractice|BilingualReader/.test(filePath)
    },
    {
      name: 'Bất biến Auth: Cấm tạo lại form đăng ký email/password thủ công (Hệ thống dùng 100% Google OAuth)',
      regex: /<form[^>]*>[\s\S]*?name=['"](confirmPassword|password)['"][^>]*>[\s\S]*?Đăng ký/i,
      severity: 'ERROR',
      fileFilter: (filePath) => /SignUp\.jsx|Login\.jsx|AuthModal\.jsx/.test(filePath)
    },
    {
      name: 'Bất biến Dữ liệu Part 1: Part 1 chỉ có 4 levels, tuyệt đối không có Level 5',
      regex: /partNum\s*===?\s*1\s*&&\s*levelNum\s*===?\s*5/i,
      severity: 'ERROR'
    }
  ]
};

// Đếm thống kê
let totalFilesScanned = 0;
let totalErrors = 0;
let totalWarnings = 0;
const violationLog = [];

/**
 * Quét đệ quy toàn bộ thư mục dự án
 */
function scanDirectory(dirPath, rootDir) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootDir, fullPath);

    if (entry.isDirectory()) {
      if (CONFIG.ignoreDirs.includes(entry.name)) continue;
      scanDirectory(fullPath, rootDir);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CONFIG.allowedExtensions.includes(ext)) {
        checkFile(fullPath, relPath);
      }
    }
  }
}

/**
 * Kiểm tra 1 file code cụ thể
 */
function checkFile(filePath, relPath) {
  totalFilesScanned++;
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return;
  }

  const lines = content.split('\n');

  // A. Kiểm tra độ dài file
  if (lines.length > CONFIG.maxFileLineLimit) {
    violationLog.push({
      file: relPath,
      line: lines.length,
      severity: 'WARNING',
      rule: `File quá dài (${lines.length} dòng > ${CONFIG.maxFileLineLimit} dòng). Hãy cân nhắc tách nhỏ.`
    });
    totalWarnings++;
  }

  // B. Quét từng dòng tìm vi phạm
  lines.forEach((lineText, idx) => {
    const lineNum = idx + 1;

    // 1. Quét AI Junk Comments
    for (const pattern of CONFIG.aiJunkCommentPatterns) {
      if (pattern.regex.test(lineText)) {
        violationLog.push({
          file: relPath,
          line: lineNum,
          severity: 'ERROR',
          rule: pattern.name,
          snippet: lineText.trim()
        });
        totalErrors++;
      }
    }

    // 2. Quét Banned Footguns
    for (const pattern of CONFIG.bannedPatterns) {
      if (pattern.regex.test(lineText)) {
        violationLog.push({
          file: relPath,
          line: lineNum,
          severity: pattern.severity,
          rule: pattern.name,
          snippet: lineText.trim()
        });
        if (pattern.severity === 'ERROR') totalErrors++;
        else totalWarnings++;
      }
    }

    // 3. Quét Secret Leaks
    for (const pattern of CONFIG.secretLeakPatterns) {
      if (pattern.regex.test(lineText)) {
        violationLog.push({
          file: relPath,
          line: lineNum,
          severity: 'ERROR',
          rule: pattern.name,
          snippet: lineText.trim()
        });
        totalErrors++;
      }
    }

    // 4. Quét TOEIC Domain Invariants (Tường Tận TOEIC)
    for (const rule of CONFIG.toeicDomainRules) {
      if (rule.fileFilter && !rule.fileFilter(relPath)) continue;
      if (rule.regex.test(lineText)) {
        violationLog.push({
          file: relPath,
          line: lineNum,
          severity: rule.severity,
          rule: rule.name,
          snippet: lineText.trim()
        });
        if (rule.severity === 'ERROR') totalErrors++;
        else totalWarnings++;
      }
    }
  });
}

// Bắt đầu thực thi
const rootDir = path.resolve(__dirname, '..');
console.log('='.repeat(70));
console.log('🛡️  TƯỜNG TẬN TOEIC — AGENT HARD GUARDRAILS CHECKER');
console.log(`📁 Thư mục gốc: ${rootDir}`);
console.log('='.repeat(70));

const startTime = Date.now();
scanDirectory(rootDir, rootDir);
const durationMs = Date.now() - startTime;

console.log(`\n📊 KẾT QUẢ KIỂM TRA (${durationMs}ms):`);
console.log(`   - Tổng số file đã quét: ${totalFilesScanned}`);
console.log(`   - Vi phạm nghiêm trọng (ERRORS): ${totalErrors}`);
console.log(`   - Cảnh báo (WARNINGS): ${totalWarnings}`);

if (violationLog.length > 0) {
  console.log('\n❌ CHI TIẾT VI PHẠM:');
  violationLog.forEach(v => {
    const icon = v.severity === 'ERROR' ? '🚨' : '⚠️';
    console.log(`  ${icon} [${v.severity}] ${v.file}:${v.line} -> ${v.rule}`);
    if (v.snippet) {
      console.log(`     Snippet: "${v.snippet.substring(0, 80)}"`);
    }
  });
}

console.log('='.repeat(70));

if (totalErrors > 0) {
  console.log('🚨 CHẶN ĐỨNG: Phát hiện vi phạm Hard Guardrail! Exit code: 1');
  process.exit(1);
} else {
  console.log('✅ HOÀN TẤT: Toàn bộ code tuân thủ 100% Invariants của Tường Tận TOEIC! Exit code: 0');
  process.exit(0);
}
