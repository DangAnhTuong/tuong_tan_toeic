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

async function inspectRealYears() {
  console.log('Querying mock_tests in Supabase...');
  const tests = await querySupabase('/rest/v1/mock_tests?select=id,title,year,test_number&order=year.desc,test_number.asc');
  console.log(`Found ${tests.length} mock tests in Supabase.`);
  tests.slice(0, 20).forEach(t => console.log(`- ID: ${t.id} | Year: ${t.year} | ${t.title} | Test #${t.test_number}`));
}

inspectRealYears().catch(console.error);
