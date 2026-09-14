const https = require('https');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(path) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}${path}`;
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

async function checkBuckets() {
  console.log('--- STORAGE BUCKETS ---');
  const buckets = await querySupabase('/storage/v1/bucket');
  console.log('Buckets:', buckets);

  console.log('\n--- TABLES IN REST API ---');
  // Check listening tables
  const listeningExercises = await querySupabase('/rest/v1/listening_exercises?limit=3');
  console.log('listening_exercises sample:', JSON.stringify(listeningExercises, null, 2).slice(0, 1000));

  const dictationRows = await querySupabase('/rest/v1/dictation_topics?limit=3');
  console.log('dictation_topics sample:', JSON.stringify(dictationRows, null, 2).slice(0, 1000));

  const dictationLessons = await querySupabase('/rest/v1/dictation_lessons?limit=3');
  console.log('dictation_lessons sample:', JSON.stringify(dictationLessons, null, 2).slice(0, 1000));

  const dictationSentences = await querySupabase('/rest/v1/dictation_sentences?limit=5');
  console.log('dictation_sentences sample:', JSON.stringify(dictationSentences, null, 2).slice(0, 1500));
}

checkBuckets().catch(console.error);
