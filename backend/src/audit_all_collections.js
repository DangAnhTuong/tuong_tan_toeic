const mongoose = require('mongoose');

async function auditAllCollections() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  const hasVietnameseMarks = (str) => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str || '');

  console.log('==============================================');
  console.log('AUDITING MOCKTESTS (16 Tests)');
  console.log('==============================================');
  const mocktests = await db.collection('mocktests').find({}).toArray();
  let mtTotal = 0;
  let mtNoVietnamese = 0;
  let mtEnglishClone = 0;
  let mtPrefixOnly = 0;

  for (const test of mocktests) {
    for (const q of (test.questions || [])) {
      for (const opt of (q.options || [])) {
        mtTotal++;
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();

        if (!trans) {
          mtNoVietnamese++;
        } else if (!hasVietnameseMarks(trans)) {
          // No Vietnamese diacritics
          mtNoVietnamese++;
        } else if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          // E.g. "Phương án (A): She's closing a garden gate."
          mtPrefixOnly++;
        }
      }
    }
  }
  console.log(`MockTests: Total Options = ${mtTotal}`);
  console.log(`MockTests: No Vietnamese Marks = ${mtNoVietnamese}`);
  console.log(`MockTests: "Phương án (X): [English Text]" fake translation = ${mtPrefixOnly}`);

  console.log('\n==============================================');
  console.log('AUDITING READING EXERCISES');
  console.log('==============================================');
  const reading = await db.collection('readingexercises').find({}).toArray();
  let reTotal = 0;
  let reNoVietnamese = 0;
  let rePrefixOnly = 0;

  for (const doc of reading) {
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        reTotal++;
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();

        if (!trans || !hasVietnameseMarks(trans)) {
          reNoVietnamese++;
        } else if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          rePrefixOnly++;
        }
      }
    }
  }
  console.log(`Reading: Total Options = ${reTotal}`);
  console.log(`Reading: No Vietnamese Marks = ${reNoVietnamese}`);
  console.log(`Reading: Fake prefix English = ${rePrefixOnly}`);

  console.log('\n==============================================');
  console.log('AUDITING LISTENING EXERCISES');
  console.log('==============================================');
  const listening = await db.collection('listeningexercises').find({}).toArray();
  let leTotal = 0;
  let leNoVietnamese = 0;
  let lePrefixOnly = 0;

  for (const doc of listening) {
    for (const q of (doc.questions || [])) {
      for (const opt of (q.options || [])) {
        leTotal++;
        const trans = (opt.vietnamese || opt.translation || '').trim();
        const raw = (opt.text || '').trim();

        if (!trans || !hasVietnameseMarks(trans)) {
          leNoVietnamese++;
        } else if (trans.startsWith('Phương án (') && trans.includes(raw) && raw.length > 5) {
          lePrefixOnly++;
        }
      }
    }
  }
  console.log(`Listening: Total Options = ${leTotal}`);
  console.log(`Listening: No Vietnamese Marks = ${leNoVietnamese}`);
  console.log(`Listening: Fake prefix English = ${lePrefixOnly}`);

  process.exit(0);
}

auditAllCollections();
