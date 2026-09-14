const mongoose = require('mongoose');
const { generatePedagogicalPart6Explanation } = require('./part6PedagogicalExplainer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// Known generic/broadcast explanation signatures that should definitely be replaced
const GENERIC_SIGNATURES = [
  'Dựa vào nghĩa, chọn "counters"',
  'Cần trạng từ để sửa đổi cụm từ "on your mobile device"',
  'Chủ ngữ chiếu về presidents Ilona Bergstrom',
  'Câu tiếp theo đề cập đến "inexpensive campsites"',
  'Dựa vào nghĩa, chọn counters',
  'Directly (trực tiếp) là trạng từ phù hợp'
];

async function healPart6() {
  console.log('🚀 Connecting to MongoDB to regenerate Part 6 Explanations...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const p6Docs = await db.collection('readingexercises').find({ part: 'Part 6' }).toArray();
  console.log(`Found ${p6Docs.length} Part 6 documents.`);

  let totalHealed = 0;

  for (const doc of p6Docs) {
    const qs = doc.questions || [];
    let docModified = false;

    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      const expl = q.explanation || '';

      // Check if explanation should be regenerated:
      // 1. If it matches a known generic signature
      // 2. If it is identical to previous question in the same passage
      // 3. If it is too short (< 40 chars)
      const hasGenericSignature = GENERIC_SIGNATURES.some(sig => expl.includes(sig));
      const isDuplicateOfNeighbor = (i > 0 && qs[i - 1].explanation && expl === qs[i - 1].explanation);
      const isTooShort = expl.trim().length < 40;

      if (hasGenericSignature || isDuplicateOfNeighbor || isTooShort) {
        const passageText = q.passageText || doc.passageText || '';
        const newExpl = generatePedagogicalPart6Explanation(q, passageText);
        if (newExpl && newExpl.length > 50) {
          q.explanation = newExpl;
          docModified = true;
          totalHealed++;
        }
      }
    }

    if (docModified) {
      await db.collection('readingexercises').updateOne(
        { _id: doc._id },
        { $set: { questions: doc.questions } }
      );
      console.log(`  Updated document: [${doc.title}]`);
    }
  }

  console.log('\n========================================================');
  console.log(`✅ HOÀN TẤT TÁI TẠO LỜI GIẢI PART 6 CHUẨN SƯ PHẠM ETS:`);
  console.log(`   - Tổng số câu Part 6 được cấp lời giải mới độc lập: ${totalHealed}`);
  console.log('========================================================\n');

  await mongoose.disconnect();
}

healPart6().catch(console.error);
