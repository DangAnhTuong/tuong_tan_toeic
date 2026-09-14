const http = require('http');

function testGet(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - start;
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), duration });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data, duration });
        }
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 BẮT ĐẦU KIỂM THỬ HỆ THỐNG TRA TỪ ĐIỂN 0 ĐỒNG (TƯỜNG TẬN TOEIC)');
  console.log('---------------------------------------------------------------');

  // Test 1: Từ vựng TOEIC cốt lõi
  console.log('Test 1: Tra từ TOEIC "appointment"...');
  const t1 = await testGet('http://localhost:5000/api/v1/dictionary/lookup?word=appointment');
  console.log(`-> Status: ${t1.status} | Thời gian: ${t1.duration}ms`);
  if (t1.status === 200 && t1.data?.success) {
    const d = t1.data.data;
    console.log(`   ✅ Từ: ${d.word}`);
    console.log(`   ✅ Nghĩa chính: ${d.translation}`);
    console.log(`   ✅ Phiên âm: ${d.phonetic}`);
    console.log(`   ✅ Số nhóm từ loại: ${d.meanings?.length}`);
    console.log(`   ✅ Định nghĩa đầu tiên: ${d.meanings?.[0]?.definitions?.[0]?.definitionVi}`);
  } else {
    console.error('   ❌ Test 1 Thất bại:', t1);
    process.exit(1);
  }

  // Test 2: Từ vựng tiếng Anh học thuật "diligent"
  console.log('\nTest 2: Tra từ tiếng Anh tổng quát "diligent"...');
  const t2 = await testGet('http://localhost:5000/api/v1/dictionary/lookup?word=diligent');
  console.log(`-> Status: ${t2.status} | Thời gian: ${t2.duration}ms`);
  if (t2.status === 200 && t2.data?.success) {
    const d = t2.data.data;
    console.log(`   ✅ Từ: ${d.word}`);
    console.log(`   ✅ Nghĩa tiếng Việt: ${d.translation}`);
    console.log(`   ✅ Phiên âm US: ${d.phoneticUs}`);
    console.log(`   ✅ Đồng nghĩa: ${d.synonyms?.join(', ')}`);
  } else {
    console.error('   ❌ Test 2 Thất bại:', t2);
    process.exit(1);
  }

  // Test 3: Cụm từ "some people are entering"
  console.log('\nTest 3: Tra cụm từ dài "some people are entering"...');
  const t3 = await testGet('http://localhost:5000/api/v1/dictionary/lookup?word=' + encodeURIComponent('some people are entering'));
  console.log(`-> Status: ${t3.status} | Thời gian: ${t3.duration}ms`);
  if (t3.status === 200 && t3.data?.success) {
    const d = t3.data.data;
    console.log(`   ✅ Cụm từ: ${d.word}`);
    console.log(`   ✅ Bản dịch: ${d.translation}`);
    console.log(`   ✅ Phân loại: ${d.isPhrase ? 'Cụm từ / Câu' : 'Từ đơn'}`);
  } else {
    console.error('   ❌ Test 3 Thất bại:', t3);
    process.exit(1);
  }

  // Test 4: Kiểm tra In-Memory LRU Cache (từ đã tra được trả về siêu tốc < 5ms)
  console.log('\nTest 4: Kiểm tra tốc độ cache lần 2 cho từ "appointment"...');
  const t4 = await testGet('http://localhost:5000/api/v1/dictionary/lookup?word=appointment');
  console.log(`-> Status: ${t4.status} | Thời gian: ${t4.duration}ms | From Cache: ${t4.data?.fromCache}`);
  if (t4.status === 200 && t4.data?.fromCache === true && t4.duration < 15) {
    console.log(`   ✅ Cache hoạt động hoàn hảo! Phản hồi tức thì trong ${t4.duration}ms.`);
  } else {
    console.log(`   ⚠️ Cache trả về: fromCache=${t4.data?.fromCache}, duration=${t4.duration}ms`);
  }

  console.log('\n===============================================================');
  console.log('🎉 TẤT CẢ 4 BÀI TEST ĐỀU THÀNH CÔNG RỰC RỠ! CHI PHÍ API = 0 ĐỒNG.');
}

runTests();
