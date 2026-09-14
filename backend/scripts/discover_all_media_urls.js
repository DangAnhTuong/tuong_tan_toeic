const mongoose = require('mongoose');

async function discoverAllMedia() {
  await mongoose.connect('mongodb://127.0.0.1:27017/tuong_tan_toeic');
  const db = mongoose.connection.db;

  console.log('================================================================');
  console.log('🔍 KHÁM PHÁ TOÀN BỘ LINK MEDIA CDN (AUDIO & ẢNH ETS) TRÊN HỆ THỐNG');
  console.log('================================================================\n');

  // 1. MockTests
  const mockTests = await db.collection('mocktests').find({}).toArray();
  const mockAudios = new Set();
  const mockImages = new Set();
  const mockMediaList = [];

  mockTests.forEach(t => {
    if (t.audioUrl) {
      mockAudios.add(t.audioUrl);
      mockMediaList.push({ source: 'mocktest-header', doc: t.title, type: 'audio', url: t.audioUrl });
    }
    (t.questions || []).forEach(q => {
      if (q.audioUrl) {
        mockAudios.add(q.audioUrl);
        mockMediaList.push({ source: 'mocktest-question', doc: t.title, qNum: q.questionNum, type: 'audio', url: q.audioUrl });
      }
      if (q.imageUrl) {
        mockImages.add(q.imageUrl);
        mockMediaList.push({ source: 'mocktest-question', doc: t.title, qNum: q.questionNum, type: 'image', url: q.imageUrl });
      }
    });
  });

  console.log(`📌 1. BỘ ĐỀ THI ETS MOCK TESTS (10 BỘ ĐỀ):`);
  console.log(`- Số lượng bản ghi Audio: ${mockMediaList.filter(m => m.type === 'audio').length}`);
  console.log(`- Số lượng bản ghi Ảnh: ${mockMediaList.filter(m => m.type === 'image').length}`);
  console.log(`- Tổng số bản ghi media trong MockTests: ${mockMediaList.length}`);
  console.log(`- Số URL Audio duy nhất (unique): ${mockAudios.size}`);
  console.log(`- Số URL Ảnh duy nhất (unique): ${mockImages.size}`);
  console.log(`- Tổng số URL media duy nhất trong MockTests: ${mockAudios.size + mockImages.size}`);

  // 2. Listening exercises
  const lExercises = await db.collection('listeningexercises').find({}).toArray();
  const lAudios = new Set();
  const lImages = new Set();
  const lMediaList = [];

  lExercises.forEach(doc => {
    if (doc.audioUrl) {
      lAudios.add(doc.audioUrl);
      lMediaList.push({ source: 'listening-header', doc: doc.title, type: 'audio', url: doc.audioUrl });
    }
    const list = doc.questions || doc.items || [];
    list.forEach((q, idx) => {
      if (q.audioUrl) {
        lAudios.add(q.audioUrl);
        lMediaList.push({ source: 'listening-item', doc: doc.title, idx, type: 'audio', url: q.audioUrl });
      }
      if (q.imageUrl) {
        lImages.add(q.imageUrl);
        lMediaList.push({ source: 'listening-item', doc: doc.title, idx, type: 'image', url: q.imageUrl });
      }
    });
  });

  console.log(`\n📌 2. PHÂN HỆ LUYỆN NGHE & CHÉP CHÍNH TẢ (LISTENINGEXERCISES):`);
  console.log(`- Tổng số bản ghi media trong Listening: ${lMediaList.length}`);
  console.log(`- Số URL Audio duy nhất (unique): ${lAudios.size}`);
  console.log(`- Số URL Ảnh duy nhất (unique): ${lImages.size}`);

  // 3. Reading exercises (if any images)
  const rExercises = await db.collection('readingexercises').find({}).toArray();
  const rImages = new Set();
  rExercises.forEach(doc => {
    (doc.questions || []).forEach(q => {
      if (q.imageUrl) rImages.add(q.imageUrl);
      if (q.passageText && q.passageText.includes('<img')) {
        const matches = q.passageText.match(/src=["'](.*?)["']/g);
        if (matches) {
          matches.forEach(m => {
            const u = m.replace(/src=["']|["']/g, '');
            if (u.startsWith('http')) rImages.add(u);
          });
        }
      }
    });
  });
  console.log(`\n📌 3. PHÂN HỆ LUYỆN ĐỌC (READINGEXERCISES):`);
  console.log(`- Số URL Ảnh duy nhất (unique): ${rImages.size}`);

  // Total unique across platform
  const allUniqueUrls = new Set([...mockAudios, ...mockImages, ...lAudios, ...lImages, ...rImages]);
  console.log(`\n🔥 TỔNG TOÀN SÀN:`);
  console.log(`- Tổng số URL media (Audio & Ảnh) DUY NHẤT cần quét: ${allUniqueUrls.size} URLs`);

  await mongoose.disconnect();
}

discoverAllMedia().catch(console.error);
