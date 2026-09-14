const https = require('https');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const options = {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function inspectSupabaseTest3() {
  console.log('Querying Supabase mock_tests for Test 3...');
  const tests = await querySupabase('mock_tests?select=*&name=eq.Test 3&year=eq.2026');
  console.log('Found tests:', tests);
  if (tests.length === 0) return;

  const testId = tests[0].id;
  const q195 = await querySupabase(`mock_test_questions?select=*&test_id=eq.${testId}&question_number=eq.195`);
  console.log('\nSupabase Q195:');
  console.log(JSON.stringify(q195, null, 2));

  process.exit(0);
}

inspectSupabaseTest3().catch(e => { console.error(e); process.exit(1); });
