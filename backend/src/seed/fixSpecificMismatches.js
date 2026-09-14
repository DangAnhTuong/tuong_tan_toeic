const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const EXACT_FIXES = {
  'likewise': 'tương tự như vậy, cũng như thế',
  'sale': 'bán hàng, đợt giảm giá',
  'whatever': 'bất cứ điều gì, bất kể cái gì',
  'except for': 'ngoại trừ, trừ ra',
  'just as': 'giống như, ngay khi',
  'versus': 'so với, đối đầu với',
  'nevertheless': 'tuy nhiên, dù vậy',
  'brighten': 'làm sáng lên, bừng sáng',
  'cleaning': 'việc dọn dẹp, làm sạch',
  'along with': 'cùng với, kèm theo'
};

async function fixSpecificMismatches() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const collections = ['mocktests', 'readingexercises'];
  let fixedCount = 0;

  for (const cname of collections) {
    const col = db.collection(cname);
    const docs = await col.find({}).toArray();

    for (const doc of docs) {
      let docModified = false;
      const questions = doc.questions || [];

      for (const q of questions) {
        for (const opt of (q.options || [])) {
          const raw = (opt.text || '').trim().toLowerCase();
          if (EXACT_FIXES[raw]) {
            const currentTrans = (opt.translation || '').trim();
            // If the current translation is bad (like "Bác cũng vui..." or "Khu vực này...")
            if (
              currentTrans.includes('Bác cũng vui') ||
              currentTrans.includes('Khu vực này') ||
              currentTrans.includes('Tôi mong chúng ta') ||
              currentTrans.includes('Thay đổi này') ||
              currentTrans.includes('Những chiếc phà') ||
              currentTrans.includes('Ngoài ra, không được') ||
              currentTrans.includes('Bán đảo Devegas') ||
              currentTrans.includes('Chỉ một vài') ||
              currentTrans.includes('Đất nông nghiệp') ||
              currentTrans.includes('Xe buýt chỉ') ||
              currentTrans.includes('Chấp nhận tất cả')
            ) {
              const properTrans = EXACT_FIXES[raw];
              opt.translation = properTrans;
              opt.vietnamese = properTrans;
              docModified = true;
              fixedCount++;
              console.log(`Fixed [${cname} - ${doc.title || doc.code}]: '${opt.text}' -> '${properTrans}'`);
            }
          }
        }
      }

      if (docModified) {
        await col.updateOne({ _id: doc._id }, { $set: { questions } });
      }
    }
  }

  console.log(`\n🎉 FIXED ALL ${fixedCount} RESIDUAL MISMATCHES!`);
  await mongoose.disconnect();
}

fixSpecificMismatches();
