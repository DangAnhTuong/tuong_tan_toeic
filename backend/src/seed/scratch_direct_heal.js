const mongoose = require('mongoose');
const { PASSAGE_TRANSLATIONS } = require('./allCuratedPassagesTranslations');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

function clean(str) {
  return (str || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase();
}

function matchTranslation(pText) {
  const c = clean(pText);
  for (const [key, trans] of Object.entries(PASSAGE_TRANSLATIONS)) {
    const k = clean(key);
    if (c.includes(k) || (k.length > 15 && c.includes(k.slice(0, 15)))) {
      return trans;
    }
  }
  // Check distinctive single keywords
  if (c.includes('undeniable')) return PASSAGE_TRANSLATIONS['submission policy undeniable'];
  if (c.includes('raxconnect')) return PASSAGE_TRANSLATIONS['raxconnect'];
  if (c.includes('albert and annie')) return PASSAGE_TRANSLATIONS['albert and annie'];
  if (c.includes('rayder holdings') || c.includes('bay commons')) return PASSAGE_TRANSLATIONS['rayder holdings'];
  if (c.includes('horticulture') || c.includes('blane hotel')) return PASSAGE_TRANSLATIONS['innovations in horticulture'];
  if (c.includes('videogenie') || c.includes('felix herman')) return PASSAGE_TRANSLATIONS['video genie productions'];
  if (c.includes('bun bun books') || c.includes('darboury')) return PASSAGE_TRANSLATIONS['bun bun books'];
  if (c.includes('ogunsanya') || c.includes('art auction')) return PASSAGE_TRANSLATIONS['ogunsanya and bolden'];
  if (c.includes('edwil durables') || c.includes('david rein')) return PASSAGE_TRANSLATIONS['edwil durables'];
  if (c.includes('orange bay kitchen') || c.includes('jamaican flavours')) return PASSAGE_TRANSLATIONS['orange bay kitchen'];
  if (c.includes('kooper\'s vision') || c.includes('massachusetts optician')) return PASSAGE_TRANSLATIONS['kooper\'s vision'];
  if (c.includes('richard lahiri gallery') || c.includes('cromwood')) return PASSAGE_TRANSLATIONS['richard lahiri gallery'];
  if (c.includes('your move vehicle') || c.includes('centennial rd')) return PASSAGE_TRANSLATIONS['your move vehicle rental'];
  if (c.includes('galahad industrial') || c.includes('paul soderman')) return PASSAGE_TRANSLATIONS['galahad industrial machinery'];
  if (c.includes('ben\'s nonprofit') || c.includes('ben fineman')) return PASSAGE_TRANSLATIONS['ben\'s nonprofit burst'];
  if (c.includes('pfi.co.uk') || c.includes('chakravarty')) return PASSAGE_TRANSLATIONS['pfi.co.uk'];
  if (c.includes('consumers prefer physical') || c.includes('brick-and-mortar')) return PASSAGE_TRANSLATIONS['consumers prefer physical stores'];
  if (c.includes('camsfurniture') || c.includes('cam\'s furniture')) return PASSAGE_TRANSLATIONS['camsfurniture.ca'];
  if (c.includes('frantaexports') || c.includes('franta exports') || c.includes('jerome lennox')) return PASSAGE_TRANSLATIONS['franta exports'];
  if (c.includes('wilson autos') || c.includes('erica boyd')) return PASSAGE_TRANSLATIONS['wilson autos'];
  if (c.includes('orange light gym')) return PASSAGE_TRANSLATIONS['orange light gym'];
  if (c.includes('quinar 5000') || c.includes('stacy landon')) return PASSAGE_TRANSLATIONS['quinar 5000'];
  if (c.includes('orbys distributors') || c.includes('green canyon')) return PASSAGE_TRANSLATIONS['orbys distributors'];
  if (c.includes('simon eklund') || c.includes('the theatre lights dimmed')) return PASSAGE_TRANSLATIONS['the theatre lights dimmed'];
  if (c.includes('hellosnackvending') || c.includes('hello snack')) return PASSAGE_TRANSLATIONS['hellosnackvending.com'];
  if (c.includes('dover water supply') || c.includes('na-ri cam')) return PASSAGE_TRANSLATIONS['dover water supply'];
  if (c.includes('modern salon academy')) return PASSAGE_TRANSLATIONS['modern salon academy'];
  if (c.includes('jacobi technologies') || c.includes('soon-yee kim')) return PASSAGE_TRANSLATIONS['jacobi technologies'];
  if (c.includes('carinasolutions') || c.includes('carina solutions')) return PASSAGE_TRANSLATIONS['carinasolutions.com'];
  if (c.includes('ferd data services') || c.includes('celeste o\'brien')) return PASSAGE_TRANSLATIONS['ferd data services'];
  return null;
}

async function runDirectHeal() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const col = mongoose.connection.db.collection('readingexercises');
  const lv5Doc = await col.findOne({ part: 'Part 7', level: 5 });
  if (!lv5Doc) {
    console.error('Level 5 not found!');
    process.exit(1);
  }

  console.log('Total questions in Lv5 Part 7:', lv5Doc.questions.length);

  // 1. Heal Question 0 (Q186)
  const q0 = lv5Doc.questions[0];
  q0.promptTranslation = 'Mục đích chính của bức thư là gì?';
  q0.options = [
    {
      label: '(A)',
      text: 'To apologize for poor Internet service',
      translation: 'Để xin lỗi vì dịch vụ Internet kém',
      vietnamese: 'Để xin lỗi vì dịch vụ Internet kém'
    },
    {
      label: '(B)',
      text: 'To seek permission from a property owner',
      translation: 'Để xin phép chủ sở hữu bất động sản',
      vietnamese: 'Để xin phép chủ sở hữu bất động sản'
    },
    {
      label: '(C)',
      text: 'To provide an explanation for a delay',
      translation: 'Để đưa ra lời giải thích cho sự chậm trễ',
      vietnamese: 'Để đưa ra lời giải thích cho sự chậm trễ'
    },
    {
      label: '(D)',
      text: 'To persuade a customer to switch Internet providers',
      translation: 'Để thuyết phục khách hàng chuyển đổi nhà cung cấp Internet',
      vietnamese: 'Để thuyết phục khách hàng chuyển đổi nhà cung cấp Internet'
    }
  ];
  q0.correctAnswer = 'B';
  q0.explanation = `🎯 ĐÁP ÁN ĐÚNG: (B) To seek permission from a property owner — Để xin phép chủ sở hữu bất động sản

💡 DẪN CHỨNG & PHÂN TÍCH:
- Dẫn chứng trong bức thư của Brandy Mortimer: "Raxconnect would like to place a small Internet connection hub on your property at 29 Lefroy Street. Because of its central location on the street, your front yard would make an optimal connection point. Please call us at 0141 496 0001 by 10 April to let us know whether we may proceed." (Raxconnect muốn đặt một trạm kết nối Internet nhỏ trên tài sản của bạn tại số 29 đường Lefroy... Sân trước của bạn sẽ là một điểm kết nối tối ưu. Vui lòng gọi cho chúng tôi trước ngày 10 tháng 4 để cho biết liệu chúng tôi có thể tiến hành hay không).
- Phân tích: Bức thư được gửi tới bà Alyssa Susilo (chủ sở hữu căn nhà tại 29 Lefroy Street) nhằm mục đích xin phép lắp đặt trạm kết nối cáp quang ở sân trước của bà.
- Paraphrase: let us know whether we may proceed (cho biết liệu chúng tôi có thể tiến hành hay không) ≈ seek permission from a property owner (xin phép chủ sở hữu bất động sản).

📚 DỊCH NGHĨA PHƯƠNG ÁN:
• (A) To apologize for poor Internet service: Để xin lỗi vì dịch vụ Internet kém
• (B) To seek permission from a property owner: Để xin phép chủ sở hữu bất động sản (Đúng)
• (C) To provide an explanation for a delay: Để đưa ra lời giải thích cho sự chậm trễ
• (D) To persuade a customer to switch Internet providers: Để thuyết phục khách hàng chuyển đổi nhà cung cấp Internet`;

  // 2. Heal all questions with Langdale translation in Level 5
  let healedCount = 0;
  for (let i = 0; i < lv5Doc.questions.length; i++) {
    const q = lv5Doc.questions[i];
    const pText = q.passageText || '';
    const currentTrans = q.translation || '';

    if (currentTrans.includes('Langdale') && !pText.includes('Langdale')) {
      const match = matchTranslation(pText);
      if (match) {
        q.translation = match;
        healedCount++;
      } else {
        console.warn(`Unmatched passage at index ${i} Q${q.questionNum}: "${clean(pText).slice(0, 50)}"`);
      }
    }
  }

  // 3. Write directly to MongoDB collection
  await col.updateOne(
    { _id: lv5Doc._id },
    { $set: { questions: lv5Doc.questions } }
  );

  console.log(`🎉 Successfully updated MongoDB directly! Healed ${healedCount} passage translations and Question 186 options/explanation!`);
  process.exit(0);
}

runDirectHeal().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
