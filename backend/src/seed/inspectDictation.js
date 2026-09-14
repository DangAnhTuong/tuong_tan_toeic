const https = require('https');

const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(pathStr) {
  return new Promise((resolve, reject) => {
    https.get('https://qfhmnlvgweznzcsoijyr.supabase.co' + pathStr, {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`
      }
    }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function inspectDictation() {
  console.log('--- 1. CHECK MOCK TESTS IN SUPABASE ---');
  const testsRes = await querySupabase('/rest/v1/mock_tests?select=id,title,year,order_index&order=year.desc,order_index.asc');
  console.log(`Total mock tests in Supabase: ${testsRes.data?.length || 0}`);
  if (testsRes.data) {
    const years = {};
    testsRes.data.forEach(t => {
      years[t.year] = (years[t.year] || 0) + 1;
    });
    console.log('Tests by Year:', JSON.stringify(years, null, 2));
    console.log('Sample Tests:', JSON.stringify(testsRes.data.slice(0, 10), null, 2));
  }

  console.log('\n--- 2. CHECK QUESTIONS PER TEST FOR 2026 & 2024 ---');
  if (testsRes.data && testsRes.data.length > 0) {
    const test2026 = testsRes.data.find(t => t.year === '2026' || t.year === 2026 || t.title.includes('2026'));
    if (test2026) {
      console.log('Found 2026 Test:', test2026);
      for (const p of [1, 2, 3, 4]) {
        const qRes = await querySupabase(`/rest/v1/mock_test_questions?test_id=eq.${test2026.id}&part=eq.${p}&select=id,question_number,audio_url,transcript,dich_nghia,tu_vung`);
        console.log(`  Test ${test2026.title} Part ${p} questions: ${qRes.data?.length || 0}`);
        if (qRes.data && qRes.data[0]) {
          console.log(`    Sample Q${qRes.data[0].question_number}: audio=${qRes.data[0].audio_url ? 'YES' : 'NO'}, transcript=${qRes.data[0].transcript?.slice(0, 50)}...`);
        }
      }
    }
  }

  console.log('\n--- 3. CHECK PASSAGES FOR PART 3 & 4 IN 2026 ---');
  if (testsRes.data && testsRes.data.length > 0) {
    const test2026 = testsRes.data.find(t => t.year === '2026' || t.year === 2026 || t.title.includes('2026'));
    if (test2026) {
      for (const p of [3, 4]) {
        const passRes = await querySupabase(`/rest/v1/mock_test_passages?test_id=eq.${test2026.id}&part=eq.${p}&select=id,title,audio_url,transcript,image_url`);
        console.log(`  Test ${test2026.title} Part ${p} passages: ${passRes.data?.length || 0}`);
        if (passRes.data && passRes.data[0]) {
          console.log(`    Sample passage: audio=${passRes.data[0].audio_url}, transcript=${passRes.data[0].transcript?.slice(0, 50)}...`);
        }
      }
    }
  }

  console.log('\n--- 4. CHECK TOPIC DOMAINS IN SUPABASE ---');
  const topicQ = await querySupabase('/rest/v1/mock_test_questions?topic_domain=not.is.null&select=part,topic_domain&limit=50');
  console.log('Questions with topic_domain count:', topicQ.data?.length || 0);

  const topicP = await querySupabase('/rest/v1/mock_test_passages?topic_domain=not.is.null&select=part,topic_domain&limit=50');
  console.log('Passages with topic_domain count:', topicP.data?.length || 0);
}

inspectDictation();
