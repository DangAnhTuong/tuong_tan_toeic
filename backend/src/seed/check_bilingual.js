const mongoose = require('mongoose');

async function checkBilingual() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;
  const articles = await db.collection('readingexercises').find({ mode: 'bilingual' }).toArray();
  console.log('Bilingual Articles in DB:', articles.length);
  articles.forEach(a => {
    const art = a.bilingualArticle || {};
    const paraCount = (art.paragraphs || []).length;
    const vocabCount = (art.vocabulary || []).length;
    const qCount = (art.questions || []).length;
    console.log(`- [Lv${a.level}] ${a.title}: ${paraCount} paras, ${vocabCount} vocabs, ${qCount} questions`);
  });
  process.exit(0);
}

checkBilingual().catch(e => { console.error(e); process.exit(1); });
