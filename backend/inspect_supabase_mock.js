const https = require('https');
const mongoose = require('mongoose');

const SUPABASE_URL = 'https://qfhmnlvgweznzcsoijyr.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    https.get(url, { headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function inspectSupabaseMock() {
  const rows = await querySupabase('mock_test_questions?limit=5&part=eq.7');
  console.log('Columns in mock_test_questions:');
  if (rows && rows[0]) {
    console.log(Object.keys(rows[0]));
    console.log('Sample row:');
    console.log('question_number:', rows[0].question_number);
    console.log('question_text:', rows[0].question_text);
    console.log('dich_nghia:', rows[0].dich_nghia);
    console.log('giai_thich_chi_tiet:', rows[0].giai_thich_chi_tiet);
    console.log('explanation_vi:', rows[0].explanation_vi);
    console.log('dich_nghia_dap_an:', rows[0].dich_nghia_dap_an);
  }
  process.exit(0);
}

inspectSupabaseMock();
