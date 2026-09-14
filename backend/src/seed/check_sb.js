const https = require('https');
const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });
}

async function check() {
  const sample = await querySupabase('mock_test_questions?select=id,test_id,question_number,question_text&limit=5');
  console.log('Sample mock_test_questions:', sample);
  
  // Also check distinct test_ids or see which tests exist in mock_tests
  const allTests = await querySupabase('mock_tests?select=id,name,year&order=year.desc,name.asc&limit=20');
  console.log('Sample mock_tests in Supabase:', allTests);

  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
