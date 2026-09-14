const axios = require('axios');

async function testReadingAPI() {
  try {
    console.log('Testing GET /api/v1/reading/exercises/p5lv2 ...');
    const res1 = await axios.get('http://localhost:5000/api/v1/reading/exercises/p5lv2');
    console.log(`✅ res1 Status: ${res1.status} | Title: "${res1.data.data.title}" | Questions count: ${res1.data.data.questions?.length}`);

    console.log('\nTesting GET /api/v1/reading/exercises/p6lv1 ...');
    const res2 = await axios.get('http://localhost:5000/api/v1/reading/exercises/p6lv1');
    console.log(`✅ res2 Status: ${res2.status} | Title: "${res2.data.data.title}" | Questions count: ${res2.data.data.questions?.length}`);

    console.log('\nTesting GET /api/v1/reading/exercises/p7lv3 ...');
    const res3 = await axios.get('http://localhost:5000/api/v1/reading/exercises/p7lv3');
    console.log(`✅ res3 Status: ${res3.status} | Title: "${res3.data.data.title}" | Questions count: ${res3.data.data.questions?.length}`);

    console.log('\nTesting GET /api/v1/reading/exercises?part=Part%205&level=2&mode=level&full=true ...');
    const res4 = await axios.get('http://localhost:5000/api/v1/reading/exercises?part=Part%205&level=2&mode=level&full=true');
    console.log(`✅ res4 Status: ${res4.status} | Count: ${res4.data.data?.length} | First exercise questions count: ${res4.data.data?.[0]?.questions?.length}`);
  } catch (err) {
    console.error('❌ Error testing reading API:', err.response?.data || err.message);
  }
}

testReadingAPI();
