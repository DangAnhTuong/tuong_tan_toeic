const axios = require('axios');

async function testReadingAPI() {
  try {
    console.log('🧪 Testing Reading Module API Endpoints...');

    // 1. GET /api/v1/reading/exercises
    const res1 = await axios.get('http://localhost:5000/api/v1/reading/exercises');
    console.log('✅ GET /api/v1/reading/exercises SUCCESS. Count:', res1.data.count);

    // 2. GET /api/v1/reading/exercises?mode=part5
    const res2 = await axios.get('http://localhost:5000/api/v1/reading/exercises?mode=part5');
    console.log('✅ GET /api/v1/reading/exercises?mode=part5 SUCCESS. Count:', res2.data.count);

    console.log('🎉 ALL READING MODULE API TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Reading API test error:', err.message);
  }
}

testReadingAPI();
