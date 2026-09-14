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
  const tests = await querySupabase('vocabulary_tests', 'select=id,set_id,name,order_index,access_level,mock_test_id&limit=500');
  console.log('All tests count:', tests.length);
  
  for (const t of tests) {
    const parts = await querySupabase('vocabulary_parts', `test_id=eq.${t.id}`);
    if (parts && parts.length > 0) {
      const partIds = parts.map(p => p.id);
      const words = await querySupabase('vocabulary_words', `part_id=in.(${partIds.join(',')})&select=id`);
      if (words.length > 100) {
        console.log(`[${t.id}] set_id="${t.set_id}" name="${t.name}" -> ${words.length} words`);
      }
    }
  }
}

main().catch(console.error);
