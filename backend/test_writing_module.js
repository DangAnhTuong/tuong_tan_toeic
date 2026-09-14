const axios = require('axios');

async function testWritingAPI() {
  try {
    console.log('🧪 Testing Writing Module API Endpoints...');

    // 1. GET /api/v1/writing/exercises
    const res1 = await axios.get('http://localhost:5000/api/v1/writing/exercises');
    console.log('✅ GET /api/v1/writing/exercises SUCCESS. Count:', res1.data.count);

    // 2. GET /api/v1/writing/exercises?part=1
    const res2 = await axios.get('http://localhost:5000/api/v1/writing/exercises?part=1');
    console.log('✅ GET /api/v1/writing/exercises?part=1 SUCCESS. Count:', res2.data.count);

    console.log('🎉 ALL WRITING MODULE API TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Writing API test error:', err.message);
  }
}

testWritingAPI();
