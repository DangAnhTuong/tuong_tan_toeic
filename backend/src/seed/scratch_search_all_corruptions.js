const mongoose = require('mongoose');

async function searchAllCorruptions() {
  await mongoose.connect('mongodb://localhost:27017/tuong_tan_toeic');
  const collections = ['readingexercises', 'mocktests', 'listeningexercises'];

  const suspiciousTerms = [
    'quyên góp',
    'đăng ký nhận',
    'thử vai',
    'bước vào, dự thi',
    'doanh nghiệp cảnh quan',
    'sản phẩm làm vườn',
    'quy định xây dựng',
    'dịch vụ bán bất động sản',
    'difficult và rewarding',
    'brightwatercenter',
    'langdale'
  ];

  for (const cName of collections) {
    const col = mongoose.connection.db.collection(cName);
    const docs = await col.find({}).toArray();
    console.log(`\n=== SEARCHING COLLECTION: ${cName} (${docs.length} docs) ===`);

    for (const term of suspiciousTerms) {
      let matchCount = 0;
      for (const doc of docs) {
        for (const q of (doc.questions || [])) {
          let hasMatch = false;
          if (q.explanation && q.explanation.toLowerCase().includes(term)) hasMatch = true;
          if (q.translation && q.translation.toLowerCase().includes(term)) {
            // only flag if passageText does not legitimately have it
            const p = (q.passageText || q.transcript || '').toLowerCase();
            if (!p.includes(term)) hasMatch = true;
          }
          for (const opt of (q.options || [])) {
            if (opt.translation && opt.translation.toLowerCase().includes(term)) {
              const oText = (opt.text || '').toLowerCase();
              if (term === 'quyên góp' && !oText.includes('donat')) hasMatch = true;
              if (term === 'thử vai' && !oText.includes('audit')) hasMatch = true;
              if (term === 'đăng ký nhận' && !oText.includes('subscri')) hasMatch = true;
              if (term === 'bước vào, dự thi' && !oText.includes('enter')) hasMatch = true;
              if (term === 'doanh nghiệp cảnh quan' && !oText.includes('landscap')) hasMatch = true;
              if (term === 'sản phẩm làm vườn' && !oText.includes('garden')) hasMatch = true;
              if (term === 'quy định xây dựng' && !oText.includes('construct') && !oText.includes('build')) hasMatch = true;
              if (term === 'dịch vụ bán bất động sản' && !oText.includes('real estate') && !oText.includes('propert')) hasMatch = true;
            }
          }
          if (hasMatch) matchCount++;
        }
      }
      if (matchCount > 0) {
        console.log(`  - Term "${term}": ${matchCount} matches!`);
      }
    }
  }

  process.exit(0);
}

searchAllCorruptions().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
