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
          resolve(data);
        }
      });
    }).on('error', reject);
  });
}

async function checkDictationTables() {
  console.log('Checking Supabase tables...');
  const tables = [
    'dictation_lessons',
    'dictation_sentences',
    'dictation_exercises',
    'listening_dictation',
    'listening_lessons',
    'listening_sentences',
    'listening_passages',
    'listening_transcripts',
    'listening_exercises',
    'mock_tests',
    'mock_test_passages',
    'mock_test_questions'
  ];

  for (const t of tables) {
    const res = await querySupabase(`${t}?limit=1`);
    if (Array.isArray(res)) {
      console.log(`✅ Table exists: "${t}" (Sample row count returned: ${res.length})`);
    } else {
      console.log(`❌ Table "${t}": ${res?.message || 'Not found'}`);
    }
  }
}

checkDictationTables().catch(console.error);
