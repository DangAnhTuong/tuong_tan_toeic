const mongoose = require('mongoose');

async function audit() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
    console.log('Connected to MongoDB tuong_tan_toeic');

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n--- COLLECTION COUNTS ---');
    for (const c of collections) {
      const count = await mongoose.connection.db.collection(c.name).countDocuments();
      console.log(`- ${c.name}: ${count} documents`);
    }

    // MockTests audit
    const MockTest = mongoose.connection.db.collection('mocktests');
    const mockTests = await MockTest.find({}, { projection: { title: 1, testNumber: 1, totalQuestions: 1, questions: 1 } }).toArray();
    let totalMockQuestions = 0;
    console.log('\n--- MOCK TESTS BREAKDOWN ---');
    for (const mt of mockTests) {
      const qLen = mt.questions ? mt.questions.length : (mt.totalQuestions || 0);
      totalMockQuestions += qLen;
      console.log(`  * ${mt.title || 'Test ' + mt.testNumber}: ${qLen} questions`);
    }
    console.log(`Total Mock Questions across all tests: ${totalMockQuestions}`);

    // Listening exercises breakdown
    const Listening = mongoose.connection.db.collection('listeningexercises');
    const lExercises = await Listening.find({}).toArray();
    let totalListeningQuestions = 0;
    let totalDictationSentences = 0;
    const lPartCounts = {};
    for (const le of lExercises) {
      const part = le.part || 'Unknown';
      lPartCounts[part] = (lPartCounts[part] || 0) + 1;
      if (le.questions) totalListeningQuestions += le.questions.length;
      if (le.dictationSentences) totalDictationSentences += le.dictationSentences.length;
    }
    console.log('\n--- LISTENING EXERCISES BREAKDOWN ---');
    console.log('Exercises by Part:', lPartCounts);
    console.log(`Total Listening Exercises: ${lExercises.length}`);
    console.log(`Total Questions inside exercises: ${totalListeningQuestions}`);
    console.log(`Total Dictation Sentences: ${totalDictationSentences}`);

    // Reading exercises breakdown
    const Reading = mongoose.connection.db.collection('readingexercises');
    const rExercises = await Reading.find({}).toArray();
    let totalReadingQuestions = 0;
    const rPartCounts = {};
    for (const re of rExercises) {
      const part = re.part || re.type || 'Unknown';
      rPartCounts[part] = (rPartCounts[part] || 0) + 1;
      if (re.questions) totalReadingQuestions += re.questions.length;
    }
    console.log('\n--- READING EXERCISES BREAKDOWN ---');
    console.log('Exercises by Part/Type:', rPartCounts);
    console.log(`Total Reading Exercises: ${rExercises.length}`);
    console.log(`Total Questions inside exercises: ${totalReadingQuestions}`);

    // Vocabulary topics breakdown
    const Vocab = mongoose.connection.db.collection('vocabularytopics');
    const vTopics = await Vocab.find({}).toArray();
    let totalWords = 0;
    for (const vt of vTopics) {
      if (vt.words) totalWords += vt.words.length;
    }
    console.log('\n--- VOCABULARY BREAKDOWN ---');
    console.log(`Total Vocabulary Topics: ${vTopics.length}`);
    console.log(`Total Words across all topics: ${totalWords}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Audit error:', err);
  }
}

audit();

