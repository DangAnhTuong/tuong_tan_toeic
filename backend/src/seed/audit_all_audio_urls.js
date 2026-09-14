const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

async function auditAudioUrls() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  let totalAudioChecked = 0;
  let missingAudioCount = 0;
  let invalidAudioCount = 0;

  // 1. Audit Mock Tests
  console.log('\n🎧 1. Checking Mock Tests Audio URLs (Tests 1 - 10)...');
  const mockTests = await db.collection('mocktests').find({}).toArray();
  for (const test of mockTests) {
    const listeningQs = (test.questions || []).filter(q => q.questionNumber <= 100);
    for (const q of listeningQs) {
      totalAudioChecked++;
      const audio = (q.audioUrl || '').trim();
      if (!audio) {
        missingAudioCount++;
        console.error('  ❌ Missing audio: Test "' + test.title + '" Q' + q.questionNumber);
      } else if (!audio.startsWith('http://') && !audio.startsWith('https://') && !audio.startsWith('/')) {
        invalidAudioCount++;
        console.error('  ⚠️ Non-standard audio format: Test "' + test.title + '" Q' + q.questionNumber + ': ' + audio);
      }
    }
  }

  // 2. Audit Listening Exercises
  console.log('\n🎧 2. Checking Listening Exercises Audio URLs...');
  const listeningDocs = await db.collection('listeningexercises').find({}).toArray();
  for (const doc of listeningDocs) {
    if (doc.questions && doc.questions.length > 0) {
      for (const q of doc.questions) {
        totalAudioChecked++;
        const audio = (q.audioUrl || doc.audioUrl || '').trim();
        if (!audio) {
          missingAudioCount++;
          console.error('  ❌ Missing audio: Doc "' + doc.title + '" Q' + (q.questionNumber || q.testQuestionNumber));
        }
      }
    }

    if (doc.lessons && doc.lessons.length > 0) {
      for (const lesson of doc.lessons) {
        if (lesson.sentences && lesson.sentences.length > 0) {
          for (const sent of lesson.sentences) {
            totalAudioChecked++;
            const audio = (sent.audioUrl || lesson.audioUrl || doc.audioUrl || '').trim();
            if (!audio) {
              missingAudioCount++;
              console.error('  ❌ Missing audio in lesson: Doc "' + doc.title + '" Sent "' + (sent.text || '').slice(0, 30) + '"');
            }
          }
        }
      }
    }
  }

  console.log('\n======================================================');
  console.log('📊 TOTAL AUDIOS AUDITED: ' + totalAudioChecked);
  console.log('❌ MISSING AUDIOS:       ' + missingAudioCount);
  console.log('⚠️ INVALID AUDIO URLS:   ' + invalidAudioCount);
  console.log('======================================================');

  if (missingAudioCount === 0 && invalidAudioCount === 0) {
    console.log('🎉 100% OF ALL AUDIO URLS ARE VALID AND PRESENT!');
  } else {
    console.error('⚠️ Found issues to inspect!');
  }

  process.exit(missingAudioCount > 0 ? 1 : 0);
}

auditAudioUrls().catch(err => {
  console.error(err);
  process.exit(1);
});
