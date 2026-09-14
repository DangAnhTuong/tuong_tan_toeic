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

async function updateVideoData() {
  const sbLessons = await fetchAllVideoLessons();
  console.log(`Fetched ${sbLessons.length} lessons from Supabase.`);

  const sbMapById = {};
  const sbMapByTitle = {};
  sbLessons.forEach(l => {
    sbMapById[l.id] = l;
    sbMapByTitle[l.title.trim().toLowerCase()] = l;
  });

  // 1. Update allVideoChaptersData.js
  let chaptersContent = fs.readFileSync('./src/data/allVideoChaptersData.js', 'utf8');

  // Replace each lesson's isPro field based on its supabase_id or title
  let updatedChaptersContent = chaptersContent.replace(
    /{\s*"id":\s*"([^"]+)",\s*"supabase_id":\s*"([^"]+)",\s*"title":\s*"([^"]+)",\s*"isPro":\s*(true|false),/g,
    (match, id, supabase_id, title, oldIsPro) => {
      const fromSb = sbMapById[supabase_id] || sbMapByTitle[title.trim().toLowerCase()];
      let newIsPro = oldIsPro === 'true';
      if (fromSb) {
        newIsPro = fromSb.access_level === 'course';
      }
      return `{\n        "id": "${id}",\n        "supabase_id": "${supabase_id}",\n        "title": "${title}",\n        "isPro": ${newIsPro},`;
    }
  );

  fs.writeFileSync('./src/data/allVideoChaptersData.js', updatedChaptersContent, 'utf8');
  console.log('✅ Updated allVideoChaptersData.js with real Free/VIP status from Supabase!');

  // 2. Update ipaLessonsData.js
  // In Supabase:
  // Tập 1 to 5: access_level = 'free' -> isPro: false
  // Tập 6 to 42: access_level = 'course' -> isPro: true
  let ipaContent = fs.readFileSync('./src/data/ipaLessonsData.js', 'utf8');
  let updatedIpaContent = ipaContent.replace(
    /{\s*"id":\s*"ipa_(\d+)",([\s\S]*?)"isPro":\s*(true|false),/g,
    (match, numStr, rest, oldIsPro) => {
      const num = parseInt(numStr, 10);
      const isPro = num > 5; // Tập 1-5 free, Tập 6-42 VIP
      return `{\n    "id": "ipa_${numStr}",${rest}"isPro": ${isPro},`;
    }
  );

  fs.writeFileSync('./src/data/ipaLessonsData.js', updatedIpaContent, 'utf8');
  console.log('✅ Updated ipaLessonsData.js (Tập 1-5 Free, Tập 6-42 VIP)!');
}

updateVideoData();
