const https = require('https');

const userToken = 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImUwNTFjYmQ0LTMzOTgtNGQ0Yy05NDc0LTUzNjIwMTBmN2Q5YiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3FmaG1ubHZnd2V6bnpjc29panlyLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2MmViZmQ0ZC1hMjI1LTQ3MGQtODdlNy1hZGQ0NDdkZjcyZjgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzg3NzE5MDM2LCJpYXQiOjE3ODc3MTU0MzYsImVtYWlsIjoiZGFuZ2FuaHR1YW4yNTExMjAwOEBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0xXN09QOE1fdXNoVlpMOVhXWWNvbE40MGgyT3FKWTl3TnpOTWJxN2RaZ1lVQWRGdz1zOTYtYyIsImVtYWlsIjoiZGFuZ2FuaHR1YW4yNTExMjAwOEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiVHXhuqVuIMSQ4bq3bmciLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiVHXhuqVuIMSQ4bq3bmciLCJwaG9uZV92ZXJpZmllZCI6ZmFsc2UsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NMVzdPUDhNX3VzaFZaTDlYV1ljb2xONDBoMk9xSlk5d056Tk1icTdkWmdZVUFkRnc9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExMjYxNjUzODAwMTc1MzI2OTY3MCIsInN1YiI6IjExMjYxNjUzODAwMTc1MzI2OTY3MCJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzg1NTAxNjIwfV0sInNlc3Npb25faWQiOiJkYWE0YjBlYy1mZGM2LTQ1ZWEtODc0NS1mZmI4OGY5YjJkOWYiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.EfntyvrAETUtHnnoTdLp5rXAdadPSVb1LaQQGXqNc_6IURVtssESTwrkUE_EEofleFKo3VFCaj2Z0KiyosEihg';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmaG1ubHZnd2V6bnpjc29panlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4MDYyMzQsImV4cCI6MjA4NDM4MjIzNH0.mNJAoc-uJVilLr03PT3luXsekfwJ4sICOIsOIRQu-N0';

function querySupabaseCount(pathStr) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'qfhmnlvgweznzcsoijyr.supabase.co',
      path: pathStr,
      method: 'HEAD',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${userToken}`,
        'Prefer': 'count=exact'
      }
    };

    const req = https.request(options, (res) => {
      const contentRange = res.headers['content-range'];
      resolve({ status: res.statusCode, count: contentRange ? contentRange.split('/')[1] : null, headers: res.headers });
    });

    req.on('error', reject);
    req.end();
  });
}

async function auditDauToeicDatabase() {
  console.log('=== AUDIT TOÀN BỘ CƠ SỞ DỮ LIỆU ĐẬU TOEIC ===\n');

  // 1. Passages count per part
  for (let p = 1; p <= 7; p++) {
    const res = await querySupabaseCount(`/rest/v1/mock_test_passages?part=eq.${p}`);
    console.log(`Part ${p} Passages Total: ${res.count || 'N/A'}`);
  }

  console.log('\n=== TỔNG SỐ CÂU HỎI THEO PART & LEVEL TRONG DATABASE ĐẬU TOEIC ===\n');
  for (let p = 1; p <= 7; p++) {
    const partRes = await querySupabaseCount(`/rest/v1/mock_test_questions?part=eq.${p}`);
    console.log(`\n--- PART ${p} (Tổng: ${partRes.count} câu hỏi) ---`);
    for (let lv = 1; lv <= 5; lv++) {
      const lvRes = await querySupabaseCount(`/rest/v1/mock_test_questions?part=eq.${p}&difficulty_level=eq.${lv}`);
      console.log(`  Level ${lv}: ${lvRes.count || 0} câu hỏi`);
    }
  }
}

auditDauToeicDatabase();
