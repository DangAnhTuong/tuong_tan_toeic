// ==============================================================================
//   TUONG TAN TOEIC — 100% PURE NODE.JS MONGODB IMPORTER (ZERO EXTERNAL TOOLS)
//   Imports entire database from a compressed .json.gz file
//   Usage: node scripts/import_db_node.js [path_to_file.json.gz]
// ==============================================================================

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
const INPUT_FILE = process.argv[2] || path.join(__dirname, 'tuong_tan_toeic_prod.json.gz');

async function importDatabase() {
  console.log('===============================================================');
  console.log('📥 BẮT ĐẦU NHẬP DỮ LIỆU VÀO MONGODB BẰNG NODE.JS');
  console.log(`📁 File nguồn: ${INPUT_FILE}`);
  console.log(`📡 Kết nối đích: ${MONGODB_URI}`);
  console.log('===============================================================\n');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ [ERROR] File ${INPUT_FILE} không tồn tại!`);
    process.exit(1);
  }

  const compressedBuffer = fs.readFileSync(INPUT_FILE);
  console.log('Đang giải nén file gzip...');
  const decompressedString = zlib.gunzipSync(compressedBuffer).toString('utf-8');
  console.log('Đang phân tích cấu trúc JSON...');
  const dumpData = JSON.parse(decompressedString);

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const collectionNames = Object.keys(dumpData);
  console.log(`Bắt đầu nạp ${collectionNames.length} collections vào database:\n`);

  let totalImported = 0;

  for (const colName of collectionNames) {
    const rawDocs = dumpData[colName];
    if (!rawDocs || rawDocs.length === 0) continue;

    process.stdout.write(`  ⏳ Đang nạp "${colName}" (${rawDocs.length} bản ghi)... `);

    // Chuyển đổi các trường $oid và chuỗi ISO Date thành MongoDB BSON Types
    const parsedDocs = rawDocs.map(doc => {
      const parsed = JSON.parse(JSON.stringify(doc), (key, value) => {
        if (value && typeof value === 'object' && value.$oid) {
          return new mongoose.Types.ObjectId(value.$oid);
        }
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          const d = new Date(value);
          if (!isNaN(d.getTime())) return d;
        }
        return value;
      });
      if (parsed._id && typeof parsed._id === 'string' && /^[0-9a-fA-F]{24}$/.test(parsed._id)) {
        parsed._id = new mongoose.Types.ObjectId(parsed._id);
      }
      return parsed;
    });

    const targetCol = db.collection(colName);
    // Xóa collection cũ trước khi nạp để tránh trùng lặp
    try { await targetCol.drop(); } catch (e) {}

    // Nạp theo batch 1,000 để tránh tràn bộ nhớ
    const BATCH_SIZE = 1000;
    for (let i = 0; i < parsedDocs.length; i += BATCH_SIZE) {
      const chunk = parsedDocs.slice(i, i + BATCH_SIZE);
      await targetCol.insertMany(chunk, { ordered: false });
    }

    totalImported += parsedDocs.length;
    console.log(`✅ Hoàn tất!`);
  }

  console.log('\n===============================================================');
  console.log(`🎉 NẠP DỮ LIỆU THÀNH CÔNG! Tổng số: ${totalImported} bản ghi.`);
  console.log('===============================================================');

  await mongoose.disconnect();
  process.exit(0);
}

importDatabase().catch(err => {
  console.error('\n❌ NẠP DỮ LIỆU THẤT BẠI:', err);
  process.exit(1);
});
