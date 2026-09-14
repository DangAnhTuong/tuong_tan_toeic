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
  const allTests = await querySupabase('vocabulary_tests', 'select=id,set_id,name,order_index,access_level,mock_test_id,scope_kind&limit=1000');
  console.log('Total vocabulary_tests in DB:', allTests.length);

  // Group by name patterns
  const test2023 = allTests.filter(t => t.name.toLowerCase().includes('2023') || t.name.toLowerCase().includes('test'));
  console.log('\nAll tests containing "test" or year (count):', test2023.length);

  allTests.forEach(t => {
    if (t.name.includes('2023') || t.name.includes('2024') || t.name.includes('2026') || t.name.toLowerCase().includes('master')) {
      console.log(`- [${t.id}] set_id="${t.set_id}" name="${t.name}" mock_id="${t.mock_test_id}"`);
    }
  });
}

main().catch(console.error);
