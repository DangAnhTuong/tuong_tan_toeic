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
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
      res.on('error', reject);
    });
  });
}

async function main() {
  console.log('--- Testing vocabulary_sets ---');
  const sets = await querySupabase('vocabulary_sets', 'select=*&limit=10');
  console.log('Sets status:', sets.status, 'Count:', Array.isArray(sets.data) ? sets.data.length : 'Not array');
  if (Array.isArray(sets.data)) console.log('Sample set:', sets.data[0]);

  console.log('\n--- Testing vocabulary_tests ---');
  const tests = await querySupabase('vocabulary_tests', 'select=*&limit=10');
  console.log('Tests status:', tests.status, 'Count:', Array.isArray(tests.data) ? tests.data.length : 'Not array');
  if (Array.isArray(tests.data)) console.log('Sample test:', tests.data[0]);

  console.log('\n--- Testing vocabulary_words ---');
  const words = await querySupabase('vocabulary_words', 'select=*&limit=5');
  console.log('Words status:', words.status, 'Count:', Array.isArray(words.data) ? words.data.length : 'Not array');
  if (Array.isArray(words.data)) console.log('Sample word:', words.data[0]);
}

main().catch(console.error);
