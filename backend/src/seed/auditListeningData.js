const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ListeningExercise = require('../models/ListeningExercise');

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic');
  console.log('✅ Connected to MongoDB.\n');

  // 1. Audit Tab 1: Theo dạng bài
  console.log('==================================================');
  console.log('📊 TAB 1: THEO DẠNG BÀI (MODE: TYPE / TOPIC)');
  console.log('==================================================');
  const typeDocs = await ListeningExercise.find({ mode: 'topic' });
  console.log(`Tổng số chủ đề dạng bài: ${typeDocs.length} bài`);
  for (const d of typeDocs) {
    console.log(`- [Part ${d.part}] ${d.title}: ${d.questions?.length || 0} câu`);
  }

  // 2. Audit Tab 2: Theo level (5 Levels x 4 Parts)
  console.log('\n==================================================');
  console.log('📊 TAB 2: THEO LEVEL (MODE: LEVEL — 5 LEVELS x 4 PARTS)');
  console.log('==================================================');
  for (let p = 1; p <= 4; p++) {
    console.log(`\n🎧 --- PART ${p} ---`);
    for (let lv = 1; lv <= 5; lv++) {
      const doc = await ListeningExercise.findOne({ mode: 'level', part: p, level: lv });
      const qCount = doc?.questions?.length || 0;
      console.log(`  • Level ${lv}: ${qCount} câu ${doc ? '✅' : '❌'}`);
    }
  }

  // 3. Audit Tab 3: Nghe chép (Dictation)
  console.log('\n==================================================');
  console.log('📊 TAB 3: NGHE CHÉP (MODE: DICTATION)');
  console.log('==================================================');
  const dictYears = ['2026', '2024', '2023', 'master', 'topic'];
  for (const y of dictYears) {
    const docs = await ListeningExercise.find({ mode: 'dictation', year: y });
    const totalQ = docs.reduce((acc, d) => acc + (d.questions?.length || d.totalQuestions || 0), 0);
    console.log(`\n📌 Danh mục: '${y.toUpperCase()}' — ${docs.length} bài tập | Tổng: ${totalQ} câu`);
    docs.slice(0, 4).forEach(d => {
      console.log(`   - [Part ${d.part}] ${d.title}: ${d.questions?.length || d.totalQuestions} câu`);
    });
    if (docs.length > 4) {
      console.log(`   ... và ${docs.length - 4} bài tập khác.`);
    }
  }

  // Grand total
  const allDocs = await ListeningExercise.find({});
  const grandTotalQ = allDocs.reduce((acc, d) => acc + (d.questions?.length || 0), 0);
  console.log('\n==================================================');
  console.log(`🌟 TỔNG KHO DỮ LIỆU LISTENING: ${allDocs.length} bài tập | ${grandTotalQ} câu`);
  console.log('==================================================\n');

  await mongoose.disconnect();
}

audit();
