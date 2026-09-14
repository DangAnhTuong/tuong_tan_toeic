const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function fetchAllVideoLessons() {
  return new Promise((resolve, reject) => {
    https.get(`${SUPABASE_URL}/rest/v1/video_lessons?select=id,title,access_level,order_index,chapter_id&limit=1000`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    });
  });
}

async function matchWithLocal() {
  const sbLessons = await fetchAllVideoLessons();
  console.log(`Fetched ${sbLessons.length} lessons from Supabase.`);

  const sbMapById = {};
  const sbMapByTitle = {};
  sbLessons.forEach(l => {
    sbMapById[l.id] = l;
    sbMapByTitle[l.title.trim().toLowerCase()] = l;
  });

  const localFile = fs.readFileSync('./src/data/allVideoChaptersData.js', 'utf8');
  
  // Count matches
  let matchedById = 0;
  let matchedByTitle = 0;
  let freeCount = 0;
  let vipCount = 0;

  const regex = /"id":\s*"([^"]+)",\s*"supabase_id":\s*"([^"]+)",\s*"title":\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(localFile)) !== null) {
    const [_, id, supabase_id, title] = match;
    const fromSb = sbMapById[supabase_id] || sbMapByTitle[title.trim().toLowerCase()];
    if (fromSb) {
      if (sbMapById[supabase_id]) matchedById++;
      else matchedByTitle++;
      const isVip = fromSb.access_level === 'course';
      if (isVip) vipCount++;
      else freeCount++;
      console.log(`- [${isVip ? 'VIP' : 'FREE'}] ${title} (access_level: ${fromSb.access_level})`);
    } else {
      console.log(`- [NOT FOUND IN SB] ${title}`);
    }
  }

  console.log(`\nMatched by ID: ${matchedById}, Matched by Title: ${matchedByTitle}`);
  console.log(`Free: ${freeCount}, VIP: ${vipCount}`);
}

matchWithLocal();
