const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function fetchSupabase(table, query = '') {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
    const req = https.get(url, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
  });
}

async function main() {
  console.log('Downloading all blog articles from Supabase...');
  const articles = await fetchSupabase('blog_articles', '?select=*&order=order_index.asc');
  if (Array.isArray(articles)) {
    console.log(`Successfully fetched ${articles.length} articles.`);
    const dest = path.join(__dirname, 'raw_dautoeic_blogs.json');
    fs.writeFileSync(dest, JSON.stringify(articles, null, 2), 'utf8');
    console.log(`Saved to ${dest}`);

    articles.forEach((a, i) => {
      console.log(`[${i+1}] [${a.category}] ${a.title} (${(a.content || '').length} chars)`);
    });
  } else {
    console.error('Failed:', articles);
  }
}

main().catch(console.error);
