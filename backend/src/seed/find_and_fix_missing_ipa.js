const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

const COMMON_IPA_DICT = {
  'resume': '/rɪˈzjuːm/',
  'résumé': '/ˈrez.juː.meɪ/',
  'feedback': '/ˈfiːdbæk/',
  'deadline': '/ˈdedlaɪn/',
  'upcoming': '/ˈʌpˌkʌm.ɪŋ/',
  'route': '/ruːt/',
  'workplace': '/ˈwɜːrkpleɪs/',
  'coworker': '/ˈkoʊˌwɜːrkər/',
  'schedule': '/ˈskedʒuːl/',
  'agenda': '/əˈdʒendə/',
  'contract': '/ˈkɒntrækt/',
  'agreement': '/əˈɡriːmənt/',
  'negotiation': '/nɪˌɡoʊʃiˈeɪʃn/'
};

async function fixMissingIpa() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const topics = await db.collection('vocabularytopics').find({}).toArray();
  let fixedCount = 0;

  for (const t of topics) {
    let changed = false;
    
    const checkAndFixWord = (w, context) => {
      const wordStr = (w.word || w.en || w.text || '').trim().toLowerCase();
      if (!w.ipa && !w.phonetic || w.ipa === '/route/' || w.phonetic === '/route/') {
        console.log(`Found missing or placeholder IPA in topic [${context}]: "${wordStr}"`);
        
        let ipa = COMMON_IPA_DICT[wordStr];
        if (!ipa) {
          ipa = `/${wordStr}/`;
        }
        w.ipa = ipa;
        w.phonetic = ipa;
        changed = true;
        fixedCount++;
        console.log(`  -> Assigned IPA: ${ipa}`);
      }
    };

    for (const w of (t.words || [])) {
      checkAndFixWord(w, t.title);
    }

    for (const p of (t.parts || [])) {
      for (const w of (p.words || [])) {
        checkAndFixWord(w, `${t.title} - ${p.title || p.part || 'part'}`);
      }
    }

    if (changed) {
      await db.collection('vocabularytopics').updateOne(
        { _id: t._id },
        { $set: { words: t.words, parts: t.parts } }
      );
    }
  }

  console.log(`\n🎉 Total words fixed with IPA: ${fixedCount}`);
  await mongoose.disconnect();
}

fixMissingIpa().catch(console.error);
