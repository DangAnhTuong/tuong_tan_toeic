const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// Audio folders for Part 3 and Part 4
const ETS_TESTS = [
  "2026/t1", "2026/t2", "2026/t3", "2026/t4", "2026/t5",
  "2026/t6", "2026/t7", "2026/t8", "2026/t9", "2026/t10",
  "2024/Test_01", "2024/Test_02", "2024/Test_03", "2024/Test_04", "2024/Test_05",
  "2024/Test_06", "2024/Test_07", "2024/Test_08", "2024/Test_09", "2024/Test_10",
  "2019/test1", "2019/test2", "2019/test3", "2019/test4", "2019/test5"
];

const PART3_RANGES = [
  { start: 32, end: 34 }, { start: 35, end: 37 }, { start: 38, end: 40 },
  { start: 41, end: 43 }, { start: 44, end: 46 }, { start: 47, end: 49 },
  { start: 50, end: 52 }, { start: 53, end: 55 }, { start: 56, end: 58 },
  { start: 59, end: 61 }, { start: 62, end: 64 }, { start: 65, end: 67 },
  { start: 68, end: 70 }
];

const PART4_RANGES = [
  { start: 71, end: 73 }, { start: 74, end: 76 }, { start: 77, end: 79 },
  { start: 80, end: 82 }, { start: 83, end: 85 }, { start: 86, end: 88 },
  { start: 89, end: 91 }, { start: 92, end: 94 }, { start: 95, end: 97 },
  { start: 98, end: 100 }
];

async function runPart3Part4Import() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected to MongoDB for Part 3 & 4 Seeding.');

    const possibleFiles = [
      path.join(__dirname, '../../docs/part3_extracted.json'),
      path.join(__dirname, '../../docs/part4_extracted.json'),
      path.join(__dirname, '../seed/part3_extracted.json'),
      path.join(__dirname, '../seed/part4_extracted.json')
    ];

    for (const f of possibleFiles) {
      if (fs.existsSync(f)) {
        console.log(`Found raw export: ${f}`);
      }
    }

    console.log('🚀 Part 3 & 4 Seeding Ready.');
  } catch (err) {
    console.error('Error importing Part 3 & 4:', err);
  } finally {
    mongoose.connection.close();
  }
}

if (require.main === module) {
  runPart3Part4Import();
}

module.exports = { runPart3Part4Import };
