const https = require('https');

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function get(path) {
  return new Promise((resolve, reject) => {
    https.get('https://qfhmnlvgweznzcsoijyr.supabase.co' + path, {
      headers: {
        'apikey': anonKey,
        'Authorization': 'Bearer ' + anonKey
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function inspectPassages() {
  console.log('--- SAMPLE PART 6 PASSAGE & QUESTIONS ---');
  const p6Passages = await get('/rest/v1/mock_test_passages?part=eq.6&limit=2&select=*');
  if (p6Passages.data && p6Passages.data[0]) {
    console.log('P6 Passage:', JSON.stringify(p6Passages.data[0], null, 2));
    const p6Questions = await get(`/rest/v1/mock_test_questions?passage_id=eq.${p6Passages.data[0].id}&select=*`);
    console.log(`P6 Questions (${p6Questions.data.length}):`, JSON.stringify(p6Questions.data[0], null, 2));
  }

  console.log('\n--- SAMPLE PART 7 PASSAGE & QUESTIONS ---');
  const p7Passages = await get('/rest/v1/mock_test_passages?part=eq.7&limit=2&select=*');
  if (p7Passages.data && p7Passages.data[0]) {
    console.log('P7 Passage:', JSON.stringify(p7Passages.data[0], null, 2));
    const p7Questions = await get(`/rest/v1/mock_test_questions?passage_id=eq.${p7Passages.data[0].id}&select=*`);
    console.log(`P7 Questions (${p7Questions.data.length}):`, JSON.stringify(p7Questions.data[0], null, 2));
  }
}

inspectPassages();
