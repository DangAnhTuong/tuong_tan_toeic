const https = require('https');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(table, params = '') {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
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
          resolve(data);
        }
      });
      res.on('error', reject);
    });
  });
}

async function main() {
  console.log('Fetching all vocabulary_sets...');
  const sets = await querySupabase('vocabulary_sets', 'select=*&order=order_index.asc');
  console.log('Total sets:', sets.length);
  sets.forEach(s => {
    console.log(`Set: [${s.id}] name="${s.name}" visibility="${s.visibility}" scope_kind="${s.scope_kind}"`);
  });

  console.log('\nFetching tests with name or mock_test_id...');
  const tests = await querySupabase('vocabulary_tests', 'select=id,set_id,name,access_level,scope_kind,mock_test_id&limit=100');
  console.log('Sample tests (first 20):');
  tests.slice(0, 20).forEach(t => {
    console.log(`Test: [${t.id}] set_id="${t.set_id}" name="${t.name}" access_level="${t.access_level}" scope="${t.scope_kind}"`);
  });
}

main().catch(console.error);
