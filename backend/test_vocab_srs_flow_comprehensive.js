const axios = require('axios');

async function testComprehensiveVocabFlow() {
  console.log('--- STARTING COMPREHENSIVE VOCABULARY & SRS FLOW TEST ---');
  const baseURL = 'http://localhost:5000/api/v1';

  try {
    // 1. Add words to basket
    console.log('\n1. Testing POST /vocab/basket...');
    const addRes = await axios.post(`${baseURL}/vocab/basket`, {
      words: [
        { word: 'audit_test_revenue', pos: 'n.', meaning: 'doanh thu', phonetic: '/ˈrevənuː/' },
        { word: 'audit_test_profit', pos: 'n.', meaning: 'lợi nhuận', phonetic: '/ˈprɑːfɪt/' },
        { word: 'audit_test_auditor', pos: 'n.', meaning: 'kiểm toán viên', phonetic: '/ˈɔːdɪtər/' }
      ]
    });
    console.log(`-> Saved count: ${addRes.data.count}, status: ${addRes.status}`);
    if (addRes.data.count !== 3) throw new Error('Expected 3 words saved to basket');

    // 2. Get basket words
    console.log('\n2. Testing GET /vocab/basket...');
    const basketRes = await axios.get(`${baseURL}/vocab/basket`);
    const basketWords = basketRes.data.data;
    console.log(`-> Basket total words: ${basketWords.length}`);
    const hasRevenue = basketWords.some(w => w.word === 'audit_test_revenue');
    if (!hasRevenue) throw new Error('audit_test_revenue not found in basket');

    // 3. Test rating "again" (1)
    console.log('\n3. Testing POST /vocab/rate with rating "again"...');
    const rateAgainRes = await axios.post(`${baseURL}/vocab/rate`, {
      word: 'audit_test_revenue',
      rating: 1
    });
    const againData = rateAgainRes.data.data;
    console.log(`-> Word rated "again": intervalMinutes=${againData.intervalMinutes}, againCount=${againData.againCount}, nextReviewDate=${againData.nextReviewDate}`);
    const nextReviewTime = new Date(againData.nextReviewDate).getTime();
    const diffSeconds = Math.round((nextReviewTime - Date.now()) / 1000);
    console.log(`-> nextReviewDate is in ~${diffSeconds} seconds (expected ~60s)`);
    if (diffSeconds < 0 || diffSeconds > 120) {
      throw new Error(`Unexpected diffSeconds for "again": ${diffSeconds}`);
    }

    // 4. Test rating "good" (3)
    console.log('\n4. Testing POST /vocab/rate with rating "good"...');
    const rateGoodRes = await axios.post(`${baseURL}/vocab/rate`, {
      word: 'audit_test_profit',
      rating: 3
    });
    const goodData = rateGoodRes.data.data;
    console.log(`-> Word rated "good": intervalDays=${goodData.intervalDays}, repetitionCount=${goodData.repetitionCount}`);
    if (goodData.repetitionCount < 1) throw new Error('Expected repetitionCount >= 1');

    // 5. Test GET /vocab/due-reviews
    console.log('\n5. Testing GET /vocab/due-reviews...');
    const dueRes = await axios.get(`${baseURL}/vocab/due-reviews`);
    console.log(`-> Due words count: ${dueRes.data.dueCount}`);
    if (typeof dueRes.data.dueCount !== 'number') throw new Error('Invalid dueCount');

    // 6. Test GET /vocab/my-words
    console.log('\n6. Testing GET /vocab/my-words...');
    const myWordsRes = await axios.get(`${baseURL}/vocab/my-words`);
    console.log(`-> My words total count: ${myWordsRes.data.count}`);
    const sampleWord = myWordsRes.data.data.find(w => w.word === 'audit_test_profit');
    if (!sampleWord) throw new Error('audit_test_profit not found in my-words');
    console.log(`-> Sample word: ${sampleWord.word} (status=${sampleWord.status}, isDue=${sampleWord.isDue}, isMastered=${sampleWord.isMastered})`);

    // 7. Test GET /vocab/summary
    console.log('\n7. Testing GET /vocab/summary...');
    const summaryRes = await axios.get(`${baseURL}/vocab/summary`);
    const summary = summaryRes.data.summary;
    console.log(`-> Total learned: ${summary.totalLearned}, Total mastered: ${summary.totalMastered}, Due: ${summary.dueCount}`);
    console.log(`-> 5 SRS Stages:`, summary.stages);
    if (!summary.stages || typeof summary.stages.level1 !== 'number') {
      throw new Error('Summary stages distribution missing or invalid');
    }

    // 8. Test DELETE /vocab/basket/:word
    console.log('\n8. Testing DELETE /vocab/basket/:word...');
    const deleteRes = await axios.delete(`${baseURL}/vocab/basket/audit_test_revenue`);
    console.log(`-> Delete response: ${deleteRes.data.message}`);

    // Verify removed from basket
    const basketAfterDel = await axios.get(`${baseURL}/vocab/basket`);
    const stillInBasket = basketAfterDel.data.data.some(w => w.word === 'audit_test_revenue');
    console.log(`-> Is still in basket: ${stillInBasket} (expected false)`);
    if (stillInBasket) throw new Error('Word was not removed from basket');

    // Clean up other test words
    await axios.delete(`${baseURL}/vocab/basket/audit_test_profit`);
    await axios.delete(`${baseURL}/vocab/basket/audit_test_auditor`);

    console.log('\n============================================================');
    console.log('✅ ALL 8 VOCABULARY & SRS LOGIC TESTS PASSED 100% PERFECTLY!');
    console.log('============================================================');
  } catch (error) {
    console.error('❌ TEST FAILED:', error.response?.data || error.message);
    process.exit(1);
  }
}

testComprehensiveVocabFlow();
