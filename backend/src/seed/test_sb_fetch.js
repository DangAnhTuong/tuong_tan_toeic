const https = require('https');
const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    https.get(SUPABASE_URL + '/rest/v1/' + endpoint, {
      headers: { 'apikey': ANON_KEY, 'Authorization': 'Bearer ' + ANON_KEY }
    }, (res) => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, data: d }));
    }).on('error', reject);
  });
}

async function run() {
  const res = await querySupabase('mock_test_questions?select=*&limit=1');
  console.log('Status:', res.status);
  console.log('Data snippet:', res.data.slice(0, 300));
  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });
