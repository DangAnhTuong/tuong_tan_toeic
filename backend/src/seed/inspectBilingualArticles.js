const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditBilingual() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const articles = await db.collection('readingexercises').find({ mode: 'bilingual' }).toArray();
  console.log(`Found ${articles.length} Bilingual Articles.`);

  let totalParagraphs = 0;
  let totalVocab = 0;
  let totalQuestions = 0;
  let missingQuestions = 0;
  let missingVocab = 0;
  let emptyViCount = 0;
  let keyDiscrepancies = 0;

  for (const art of articles) {
    const ba = art.bilingualArticle || {};
    const paras = ba.paragraphs || [];
    totalParagraphs += paras.length;
    for (const p of paras) {
      if (!p.vi || !p.vi.trim()) emptyViCount++;
    }

    const vocabs = ba.vocabulary || [];
    totalVocab += vocabs.length;
    if (vocabs.length === 0) missingVocab++;

    const qs = art.questions || ba.questions || [];
    totalQuestions += qs.length;
    if (qs.length === 0) missingQuestions++;

    for (const q of qs) {
      const keyOpt = (q.options || []).find(o => o.isCorrect);
      if (!keyOpt) {
        console.log(`[${art.title}] Q#${q.questionNum} has no option marked isCorrect!`);
        keyDiscrepancies++;
      }
    }
  }

  console.log(`- Total bilingual articles: ${articles.length}`);
  console.log(`- Total paragraphs: ${totalParagraphs}`);
  console.log(`- Empty paragraph translations: ${emptyViCount}`);
  console.log(`- Total key vocabulary words: ${totalVocab}`);
  console.log(`- Articles missing vocab highlights: ${missingVocab}`);
  console.log(`- Total questions: ${totalQuestions}`);
  console.log(`- Articles missing questions: ${missingQuestions}`);
  console.log(`- Questions with key discrepancy: ${keyDiscrepancies}`);

  await mongoose.disconnect();
}

auditBilingual().catch(console.error);
