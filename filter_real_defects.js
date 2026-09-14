const path = require('path');
const fs = require('fs');

const jsonPath = path.join(__dirname, 'backend/src/seed/all_untranslated_exhaustive.json');
const items = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const VIETNAMESE_ACCENT_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const ENGLISH_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'have', 'has', 'had', 'been', 'being',
  'one', 'some', 'there', 'he', 'she', 'they', 'his', 'her', 'their', 'on', 'in', 'at',
  'near', 'next', 'under', 'over', 'by', 'of', 'for', 'with', 'to', 'from', 'into',
  'one', 'two', 'three', 'four', 'five', 'what', 'who', 'where', 'when', 'why', 'how',
  'which', 'whose', 'whom', 'that', 'this', 'these', 'those'
]);

const realDefects = [];

for (const item of items) {
  const text = (item.text || '').trim();
  const trans = (item.currentTrans || '').trim();

  // 1. MyMemory Warning
  if (/mymemory/i.test(trans)) {
    realDefects.push({ ...item, defectType: 'mymemory_warning' });
    continue;
  }

  // 2. Empty or single dot
  if (!trans || trans === '.') {
    realDefects.push({ ...item, defectType: 'empty_or_dot' });
    continue;
  }

  // 3. "Người [English word]" (e.g. "Người one", "Người there", "Người some")
  const nguoiMatch = trans.match(/^Người\s+([a-zA-Z]+)\b/i);
  if (nguoiMatch) {
    const w = nguoiMatch[1].toLowerCase();
    if (ENGLISH_WORDS.has(w) || w.endsWith('ing') || w.endsWith('ed')) {
      realDefects.push({ ...item, defectType: 'nguoi_english' });
      continue;
    }
  }

  // 4. "Đang [English word]"
  const dangMatch = trans.match(/^Đang\s+([a-zA-Z]+)\b/i);
  if (dangMatch) {
    const w = dangMatch[1].toLowerCase();
    if (ENGLISH_WORDS.has(w) || w.endsWith('ing') || w.endsWith('ed')) {
      realDefects.push({ ...item, defectType: 'dang_english' });
      continue;
    }
  }

  // 5. Identical to English (e.g. names, codes, untranslated English words)
  if (trans.toLowerCase() === text.toLowerCase()) {
    realDefects.push({ ...item, defectType: 'identical_to_english' });
    continue;
  }

  // 6. Has English words of 2+ words with zero Vietnamese accents
  if (!VIETNAMESE_ACCENT_REGEX.test(trans) && trans.split(/\s+/).length >= 2) {
    realDefects.push({ ...item, defectType: 'untranslated_english' });
    continue;
  }
}

console.log('Total REAL defects:', realDefects.length);
const types = {};
realDefects.forEach(d => { types[d.defectType] = (types[d.defectType] || 0) + 1; });
console.log('Types:', types);

const outPath = path.join(__dirname, 'backend/src/seed/real_defects.json');
fs.writeFileSync(outPath, JSON.stringify(realDefects, null, 2));
console.log('Saved to', outPath);
