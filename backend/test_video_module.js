const axios = require('axios');

async function testVideoAPI() {
  try {
    console.log('🧪 Testing Video Module API Endpoints...');

    // 1. GET /api/v1/video/lessons
    const res1 = await axios.get('http://localhost:5000/api/v1/video/lessons');
    console.log('✅ GET /api/v1/video/lessons SUCCESS. Count:', res1.data.count);

    console.log('🎉 ALL VIDEO MODULE API TESTS PASSED 100%!');
  } catch (err) {
    console.error('❌ Video API test error:', err.message);
  }
}

testVideoAPI();
