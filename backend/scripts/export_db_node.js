// ==============================================================================
//   TUONG TAN TOEIC — 100% PURE NODE.JS MONGODB EXPORTER (ZERO EXTERNAL TOOLS)
//   Exports entire database to a single compressed .json.gz file
//   Usage: node scripts/export_db_node.js
// ==============================================================================

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const OUTPUT_FILE = path.join(__dirname, 'tuong_tan_toeic_prod.json.gz');

async function exportDatabase() {
  console.log('===============================================================');
  console.log('📦 BẮT ĐẦU XUẤT TOÀN BỘ CƠ SỞ DỮ LIỆU BẰNG NODE.JS STREAM');
  console.log(`📡 Kết nối: ${MONGODB_URI}`);
  console.log('===============================================================\n');

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = await db.collections();
  console.log(`Tìm thấy ${collections.length} collections trong database:\n`);

  const dumpData = {};
  let totalDocs = 0;

  for (const col of collections) {
    const colName = col.collectionName;
    if (colName.startsWith('system.')) continue;

    process.stdout.write(`  ⏳ Đang xuất collection "${colName}"... `);
    const docs = await col.find({}).toArray();
    dumpData[colName] = docs;
    totalDocs += docs.length;
    console.log(`✅ ${docs.length} bản ghi`);
  }

  console.log(`\nTổng số bản ghi: ${totalDocs}`);
  console.log(`Đang nén dữ liệu bằng Gzip vào ${OUTPUT_FILE}...`);

  const jsonString = JSON.stringify(dumpData);
  const compressedBuffer = zlib.gzipSync(Buffer.from(jsonString, 'utf-8'));
  fs.writeFileSync(OUTPUT_FILE, compressedBuffer);

  const stats = fs.statSync(OUTPUT_FILE);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log('\n===============================================================');
  console.log(`🎉 XUẤT DỮ LIỆU THÀNH CÔNG!`);
  console.log(`📁 File kết quả: ${OUTPUT_FILE}`);
  console.log(`💾 Dung lượng file nén: ${sizeMB} MB`);
  console.log('===============================================================');

  await mongoose.disconnect();
  process.exit(0);
}

exportDatabase().catch(err => {
  console.error('\n❌ XUẤT DỮ LIỆU THẤT BẠI:', err);
  process.exit(1);
});
