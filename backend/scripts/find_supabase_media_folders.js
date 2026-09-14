const https = require('https');

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(pathStr) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qfhmnlvgweznzcsoijyr.supabase.co',
      path: pathStr,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    };
    https.get(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(body); }
      });
    }).on('error', reject);
  });
}

async function findMediaFolders() {
  const data = await querySupabase('/rest/v1/mock_tests?select=id,title,year,media_folder&limit=100');
  if (Array.isArray(data)) {
    console.log(`Found ${data.length} mock tests on Supabase:`);
    const byYear = {};
    data.forEach(t => {
      if (!byYear[t.year]) byYear[t.year] = [];
      byYear[t.year].push({ title: t.title, folder: t.media_folder });
    });
    for (const [yr, tests] of Object.entries(byYear)) {
      console.log(`\n=== YEAR ${yr} (${tests.length} tests) ===`);
      tests.slice(0, 10).forEach(t => console.log(`  ${t.title} -> folder: "${t.folder}"`));
    }
  } else {
    console.log('Error or raw data:', data);
  }
  process.exit(0);
}

findMediaFolders().catch(console.error);
