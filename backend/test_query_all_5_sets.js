const https = require('https');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

const TARGET_SETS = {
  '600_vocab': '66c99944-ebc5-43b8-93e2-994a73406b99',
  'test_2023': 'c5d94dfd-cb16-44f7-a057-37ea5b5ded20',
  'test_2024': '5900e7c8-0397-4ae5-9cc2-791ea8bb7737',
  'test_2026': '21793dec-3c53-4e8b-923a-72a2a3bf491a',
  'toeic_master': 'cbaec15d-7213-48d9-a7ba-c0c7daf91fef'
};

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
  for (const [key, setId] of Object.entries(TARGET_SETS)) {
    console.log(`\n=================== ${key} (set_id: ${setId}) ===================`);
    const tests = await querySupabase('vocabulary_tests', `set_id=eq.${setId}&order=order_index.asc`);
    console.log(`Found ${tests.length} tests in ${key}:`);
    for (const t of tests) {
      // Query parts or words
      const parts = await querySupabase('vocabulary_parts', `test_id=eq.${t.id}`);
      let totalWords = 0;
      if (parts && parts.length > 0) {
        const partIds = parts.map(p => p.id);
        const words = await querySupabase('vocabulary_words', `part_id=in.(${partIds.join(',')})&select=id`);
        totalWords = words.length;
      }
      console.log(`  - [${t.id}] "${t.name}": ${parts.length} parts, ${totalWords} words (access: ${t.access_level})`);
    }
  }
}

main().catch(console.error);
