const axios = require('axios');

async function testVocabAPI() {
  try {
    console.log('🧪 Testing Vocabulary Module API Endpoints...');

    // 1. GET /api/v1/vocab/topics
    const res1 = await axios.get('http://localhost:5000/api/v1/vocab/topics');
    console.log('✅ GET /api/v1/vocab/topics SUCCESS. Count:', res1.data.count);

    // 2. GET /api/v1/vocab/topics?category=600_vocab
    const res2 = await axios.get('http://localhost:5000/api/v1/vocab/topics?category=600_vocab');
    console.log('✅ GET /api/v1/vocab/topics?category=600_vocab SUCCESS. Count:', res2.data.count);

    // 3. POST /api/v1/vocab/rate (SM-2 Rating)
    const res3 = await axios.post('http://localhost:5000/api/v1/vocab/rate', {
      word: 'persuade',
      rating: 'good'
    });
    console.log('✅ POST /api/v1/vocab/rate (SM-2) SUCCESS. Interval:', res3.data.data.intervalDays, 'days');

    console.log('🎉 ALL VOCABULARY MODULE API TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Vocab API test error:', err.message);
  }
}

testVocabAPI();
