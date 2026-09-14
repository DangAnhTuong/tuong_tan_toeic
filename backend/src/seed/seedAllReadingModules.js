const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// =========================================================================
// 16 GRAMMAR TOPICS DEFINITION (THEORY + RULES + EXERCISES)
// =========================================================================
const GRAMMAR_TOPICS = [
  {
    topicId: 'nouns',
    title: 'Danh từ (Nouns)',
    subTitle: 'Vị trí, đuôi nhận biết danh từ, danh từ đếm được & không đếm được trong đề thi TOEIC',
    level: 1,
    levelBadge: 'A2',
    theoryMarkdown: `
# Chuyên Đề: Danh Từ Trong Đề Thi TOEIC

### 1. Vị trí của Danh Từ trong câu
- **Làm Chủ ngữ (Subject):** Đứng đầu câu trước động từ chính.
  * *Ví dụ:* **The manager** approved the new budget proposal.
- **Làm Tân ngữ (Object):** Đứng sau ngoại động từ hoặc giới từ.
  * *Ví dụ:* We received **an inquiry** from the supplier.
- **Đứng sau Tính từ sở hữu / Mạo từ / Chỉ định từ:** *a, an, the, this, that, my, your, our, each, every...*
  * *Ví dụ:* Our **production** has increased significantly.

### 2. Các đuôi nhận biết Danh từ phổ biến
- **Danh từ chỉ vật/khái niệm:** \`-tion, -sion, -ment, -ance, -ence, -ity, -ness, -ship, -ism, -age, -ure\`
  * *Ví dụ:* *information, decision, development, performance, convenience, availability, awareness...*
- **Danh từ chỉ người:** \`-er, -or, -ee, -ant, -ent, -ist\`
  * *Ví dụ:* *manager, supervisor, employee, applicant, resident, specialist...*

### 3. Bẫy TOEIC thường gặp
> [!WARNING]
> Phân biệt danh từ đếm được (cần mạo từ *a/an* hoặc đuôi số nhiều *-s/-es*) và danh từ không đếm được (*information, equipment, advice, luggage, furniture, baggage* - KHÔNG BAO GIỜ thêm *-s*).
    `,
    rules: [
      {
        title: 'Quy tắc đứng sau Giới từ & Tính từ',
        formula: 'Prep / Adj + Noun',
        explanation: 'Sau giới từ (in, on, at, for, with...) hoặc tính từ luôn cần một Danh từ/Cụm danh từ.',
        examples: [
          { sentence: 'Thank you for your cooperation.', translation: 'Cảm ơn sự hợp tác của bạn.', highlight: 'cooperation' }
        ]
      }
    ]
  },
  {
    topicId: 'pronouns',
    title: 'Đại từ (Pronouns)',
    subTitle: 'Đại từ nhân xưng, tính từ sở hữu, đại từ sở hữu và đại từ phản thân',
    level: 1,
    levelBadge: 'A2',
    theoryMarkdown: `
# Chuyên Đề: Đại Từ Trong TOEIC

### 1. Bảng phân loại Đại từ
| Đại từ nhân xưng (Chủ ngữ) | Tân ngữ (Object) | Tính từ sở hữu | Đại từ sở hữu | Đại từ phản thân |
| :--- | :--- | :--- | :--- | :--- |
| **I** | me | my (+ N) | mine | myself |
| **You** | you | your (+ N) | yours | yourself / yourselves |
| **He** | him | his (+ N) | his | himself |
| **She** | her | her (+ N) | hers | herself |
| **It** | it | its (+ N) | its | itself |
| **We** | us | our (+ N) | ours | ourselves |
| **They** | them | their (+ N) | theirs | themselves |

### 2. Mẹo giải nhanh Part 5
- Trước danh từ -> Chọn **Tính từ sở hữu** (*our, their, his, her...*).
- Đứng sau động từ hoặc giới từ -> Chọn **Tân ngữ** hoặc **Đại từ phản thân** (nếu chủ ngữ và tân ngữ cùng là một đối tượng).
- Làm chủ ngữ -> Chọn **Đại từ nhân xưng**.
- Đứng cuối câu hoặc ngay sau chủ ngữ để nhấn mạnh -> Chọn **by + Đại từ phản thân** (*by himself = on his own*).
    `
  },
  {
    topicId: 'adjectives_adverbs',
    title: 'Tính từ & Trạng từ (Adjectives & Adverbs)',
    subTitle: 'Vị trí tính từ, trạng từ chỉ tần suất/mức độ và trật tự từ trong cụm danh từ',
    level: 2,
    levelBadge: 'B1',
    theoryMarkdown: `
# Chuyên Đề: Tính Từ & Trạng Từ

### 1. Vị trí của Tính từ
- Đứng trước Danh từ để bổ nghĩa: \`Adj + Noun\` (*efficient service, qualified candidates*).
- Đứng sau Linking Verbs: \`be, become, remain, seem, look, feel, taste, sound... + Adj\`
- Cấu trúc: \`make / find / keep / consider + O + Adj\`
  * *Ví dụ:* The software makes data management **easy**.

### 2. Vị trí của Trạng từ (Adv = Adj + -ly)
- Bổ nghĩa cho Động từ thường: Đứng trước động từ chính hoặc sau tân ngữ (*work diligently*).
- Bổ nghĩa cho Tính từ: \`Adv + Adj\` (*extremely successful, highly recommended*).
- Bổ nghĩa cho Trạng từ khác: \`Adv + Adv\` (*surprisingly quickly*).
- Bổ nghĩa cho cả câu: Đứng đầu câu trước dấu phẩy (*Unfortunately, the flight was cancelled.*).
    `
  },
  {
    topicId: 'tenses',
    title: 'Các thì trong tiếng Anh (12 Tenses)',
    subTitle: 'Hiện tại đơn, tiếp diễn, hoàn thành, quá khứ đơn, tương lai đơn và dấu hiệu nhận biết',
    level: 2,
    levelBadge: 'B1',
    theoryMarkdown: `
# Chuyên Đề: 12 Thì Trong Tiếng Anh

### 1. Nhóm thì Hiện Tại
- **Hiện tại đơn (Simple Present):** Thói quen, lịch trình, sự thật hiển nhiên.
  * *Dấu hiệu:* *always, usually, frequently, every month, once a week.*
- **Hiện tại hoàn thành (Present Perfect):** Hành động bắt đầu trong quá khứ kéo dài đến hiện tại.
  * *Dấu hiệu:* *since, for, already, yet, recently, over the past 3 years.*

### 2. Nhóm thì Quá Khứ
- **Quá khứ đơn (Simple Past):** Đã kết thúc hoàn toàn trong quá khứ.
  * *Dấu hiệu:* *yesterday, last week, in 2020, ago, previously.*

### 3. Nhóm thì Tương Lai
- **Tương lai đơn (Simple Future):** Kế hoạch sắp tới.
  * *Dấu hiệu:* *tomorrow, next month, soon, shortly, upcoming.*
    `
  },
  {
    topicId: 'passive_voice',
    title: 'Câu bị động (Passive Voice)',
    subTitle: 'Cấu trúc be + V3/ed, bị động của động từ khuyết thiếu và bị động kép',
    level: 3,
    levelBadge: 'B2',
    theoryMarkdown: `
# Chuyên Đề: Câu Bị Động Trong TOEIC

### 1. Công thức cốt lõi
$$\\text{Subject} + \\text{be} + \\text{V3/V-ed} + (\\text{by Agent})$$

### 2. Mẹo nhận diện Bị động trong Part 5
- Nếu sau chỗ trống **KHÔNG CÓ TÂN NGỮ (Object)** -> 90% chọn **Câu bị động**.
- *Ví dụ:* The annual seminar will be **held** in Conference Room B.
    `
  },
  {
    topicId: 'verb_forms',
    title: 'To V / V-ing / Bare Inf (Dạng động từ)',
    subTitle: 'Động từ theo sau bởi To V hoặc V-ing và các cụm từ cố định trong công sở',
    level: 3,
    levelBadge: 'B2',
    theoryMarkdown: `
# Chuyên Đề: To V và V-ing

### 1. Các động từ đi với To V
- *agree, decide, plan, promise, offer, hope, refuse, manage, want, aim, tend, intend, fail + To V*

### 2. Các động từ đi với V-ing
- *avoid, consider, delay, postpone, recommend, suggest, enjoy, finish, mind, practice + V-ing*

### 3. Các cụm từ giới từ đi với V-ing (Bẫy cực hay gặp)
- *look forward to + V-ing* (mong đợi)
- *be committed to / be dedicated to + V-ing* (tận tâm)
- *in addition to + V-ing* (bên cạnh việc)
    `
  },
  {
    topicId: 'participles',
    title: 'Phân từ (Participles: V-ing / V-ed)',
    subTitle: 'Tính từ phân từ chủ động V-ing và bị động V-ed, rút gọn mệnh đề phân từ',
    level: 3,
    levelBadge: 'B2',
    theoryMarkdown: `
# Chuyên Đề: Phân Từ (V-ing & V-ed)

### 1. Tính từ phân từ (Participial Adjectives)
- **V-ing (Chủ động/Bản chất sự việc):** *interesting presentation, challenging task, demanding boss, lasting relationship.*
- **V-ed (Bị động/Cảm xúc người/Trạng thái nhận tác động):** *satisfied customer, revised contract, enclosed document, experienced worker.*
    `
  },
  {
    topicId: 'prepositions',
    title: 'Giới từ (Prepositions)',
    subTitle: 'Giới từ chỉ thời gian, nơi chốn, phương thức và các cụm giới từ cố định',
    level: 2,
    levelBadge: 'B1',
    theoryMarkdown: `
# Chuyên Đề: Giới Từ Trong Đề Thi TOEIC

### 1. Giới từ chỉ Thời gian
- **In:** Tháng, năm, mùa, thế kỷ (*in July, in 2024*).
- **On:** Thứ, ngày cụ thể (*on Monday, on October 15th*).
- **At:** Giờ chính xác (*at 9:00 AM, at noon*).
- **Within:** Trong vòng khoảng thời gian (*within 5 business days*).
- **By:** Trước thời điểm nào đó (*by Friday afternoon*).
- **Until:** Cho đến tận khi (*until further notice*).
    `
  },
  {
    topicId: 'conjunctions',
    title: 'Liên từ (Conjunctions)',
    subTitle: 'Phân biệt liên từ nối mệnh đề và giới từ nối cụm danh từ',
    level: 3,
    levelBadge: 'B2',
    theoryMarkdown: `
# Chuyên Đề: Phân Biệt Liên Từ và Giới Từ

| Liên từ (+ Clause: S + V) | Giới từ (+ Noun / V-ing) | Nghĩa |
| :--- | :--- | :--- |
| **Although / Even though / Though** | **Despite / In spite of** | Mặc dù |
| **Because / Since / As** | **Because of / Due to / Owing to** | Bởi vì |
| **While / Whereas** | **During** | Trong khi |
| **Provided that / As long as** | **In case of** | Với điều kiện là / Phòng khi |
    `
  },
  {
    topicId: 'relative_clauses',
    title: 'Mệnh đề quan hệ (Relative Clauses)',
    subTitle: 'Who, Whom, Whose, Which, That, Where, When và rút gọn mệnh đề quan hệ',
    level: 4,
    levelBadge: 'C1',
    theoryMarkdown: `
# Chuyên Đề: Mệnh Đề Quan Hệ

### 1. Đại từ quan hệ
- **Who:** Thay thế cho người làm chủ ngữ.
- **Whom:** Thay thế cho người làm tân ngữ.
- **Which:** Thay thế cho vật/sự việc.
- **Whose:** Sở hữu (+ Danh từ).
- **That:** Thay cho cả người và vật trong mệnh đề xác định (không đứng sau dấu phẩy).
    `
  },
  {
    topicId: 'conditionals_subjunctive',
    title: 'Câu điều kiện & Thể giả định',
    subTitle: 'Điều kiện loại 1, 2, 3, đảo ngữ điều kiện và cấu trúc bàng thái cách',
    level: 4,
    levelBadge: 'C1',
    theoryMarkdown: `
# Chuyên Đề: Câu Điều Kiện & Thể Giả Định

### 1. Đảo ngữ Câu Điều Kiện (Cực hay thi TOEIC 750+)
- **Loại 1:** \`Should + S + V(bare), S + will + V\`
  * *Ví dụ:* **Should you require** further assistance, please contact us.
- **Loại 2:** \`Were + S + to V / Were S + Adj, S + would + V\`
- **Loại 3:** \`Had + S + V3/ed, S + would have + V3/ed\`
    `
  },
  {
    topicId: 'comparisons',
    title: 'Câu so sánh (Comparisons)',
    subTitle: 'So sánh bằng as...as, so sánh hơn, so sánh nhất và so sánh kép',
    level: 3,
    levelBadge: 'B2',
    theoryMarkdown: `
# Chuyên Đề: Các Cấu Trúc So Sánh

### 1. So sánh bằng
$$\\text{as} + \\text{Adj / Adv} + \\text{as}$$
* *Ví dụ:* The new printer is as efficient as the previous model.

### 2. So sánh hơn & Từ nhấn mạnh
- Ngắn: \`Adj-er / Adv-er + than\`
- Dài: \`more + Adj / Adv + than\`
- **Từ nhấn mạnh so sánh hơn:** *much, far, significantly, substantially, even* (*much faster, significantly higher*).
    `
  },
  {
    topicId: 'inversions',
    title: 'Đảo ngữ (Inversions)',
    subTitle: 'Đảo ngữ với phó từ phủ định, Only, Not only... but also',
    level: 5,
    levelBadge: 'C1',
    theoryMarkdown: `
# Chuyên Đề: Đảo Ngữ Nâng Cao

### 1. Đảo ngữ với phó từ phủ định đứng đầu câu
- *Rarely, Seldom, Hardly, Scarcely, Never, Under no circumstances + Trợ động từ + S + V*
* *Ví dụ:* **Never have I seen** such a dedicated team.
    `
  },
  {
    topicId: 'subject_verb_agreement',
    title: 'Sự hòa hợp Chủ ngữ & Động từ',
    subTitle: 'Quy tắc chia động từ số ít/số nhiều theo các dạng chủ ngữ đặc biệt',
    level: 2,
    levelBadge: 'B1',
    theoryMarkdown: `
# Chuyên Đề: Sự Hòa Hợp Chủ Ngữ & Động Từ

### 1. Chủ ngữ luôn chia số ít
- Danh động từ làm chủ ngữ: \`V-ing + V(sing)\` (*Marketing products requires creativity.*)
- Đại từ bất định: *everyone, someone, nobody, each, every + V(sing)*.
- Tiêu đề sách, phim, tên công ty: *V(sing)*.
    `
  },
  {
    topicId: 'modal_verbs',
    title: 'Động từ khuyết thiếu (Modal Verbs)',
    subTitle: 'Can, Could, May, Might, Must, Should, Would và dạng phỏng đoán trong quá khứ',
    level: 2,
    levelBadge: 'B1',
    theoryMarkdown: `
# Chuyên Đề: Động Từ Khuyết Thiếu

- **Must:** Bắt buộc phải làm (quy định).
- **Should / Ought to:** Lời khuyên nên làm.
- **May / Might:** Khả năng có thể xảy ra.
- **Must have + V3/ed:** Chắc hẳn là đã xảy ra trong quá khứ (suy đoán chắc chắn).
    `
  },
  {
    topicId: 'word_formation',
    title: 'Cấu tạo từ & Gia đình từ (Word Families)',
    subTitle: 'Phương pháp nhận diện gốc từ, tiền tố, hậu tố để đoán nghĩa từ vựng mới',
    level: 3,
    levelBadge: 'B2',
    theoryMarkdown: `
# Chuyên Đề: Cấu Tạo Từ (Word Formation)

- **Tiền tố phủ định:** *un-, in-, im-, dis-, non-, mis-* (*unexpected, incorrect, impossible, dissatisfied*).
- **Hậu tố chuyển đổi từ loại:** Noun -> Adj (*success -> successful*), Adj -> Adv (*quick -> quickly*), Verb -> Noun (*inform -> information*).
    `
  }
];

// Helper to generate 40 practice questions per grammar topic
function generateGrammarQuestions(topicTitle, count = 40) {
  const sampleBank = [
    {
      prompt: 'The board of directors unanimously voted to approve the proposed budget ______ for the upcoming fiscal year.',
      options: [
        { label: 'A', text: 'allocations', translation: 'các khoản phân bổ', isCorrect: true },
        { label: 'B', text: 'allocating', translation: 'đang phân bổ', isCorrect: false },
        { label: 'C', text: 'allocated', translation: 'đã phân bổ', isCorrect: false },
        { label: 'D', text: 'allocate', translation: 'phân bổ', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau cụm danh từ "the proposed budget" cần một danh từ ghép để tạo thành cụm "budget allocations" (sự phân bổ ngân sách).',
      translation: 'Hội đồng quản trị đã nhất trí bỏ phiếu phê duyệt các khoản phân bổ ngân sách được đề xuất cho năm tài chính sắp tới.'
    },
    {
      prompt: 'Ms. Henderson has demonstrated ______ leadership skills throughout the merger process.',
      options: [
        { label: 'A', text: 'exception', translation: 'ngoại lệ', isCorrect: false },
        { label: 'B', text: 'exceptional', translation: 'xuất chúng / đặc biệt', isCorrect: true },
        { label: 'C', text: 'exceptionally', translation: 'một cách xuất chúng', isCorrect: false },
        { label: 'D', text: 'excepting', translation: 'ngoại trừ', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước cụm danh từ "leadership skills" cần một Tính từ để bổ nghĩa.',
      translation: 'Bà Henderson đã thể hiện các kỹ năng lãnh đạo xuất chúng trong suốt quá trình sáp nhập.'
    },
    {
      prompt: 'All employees are encouraged to review the updated safety guidelines ______ before entering the testing laboratory.',
      options: [
        { label: 'A', text: 'thoroughly', translation: 'một cách kỹ lưỡng', isCorrect: true },
        { label: 'B', text: 'thorough', translation: 'kỹ lưỡng', isCorrect: false },
        { label: 'C', text: 'thoroughness', translation: 'sự kỹ lưỡng', isCorrect: false },
        { label: 'D', text: 'most thorough', translation: 'kỹ lưỡng nhất', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cần một Trạng từ (Adv) để bổ nghĩa cho động từ "review".',
      translation: 'Tất cả nhân viên được khuyến khích xem xét kỹ lưỡng các hướng dẫn an toàn đã cập nhật trước khi vào phòng thí nghiệm kiểm tra.'
    },
    {
      prompt: 'The marketing conference ______ at the Grand Hyatt Hotel next Thursday morning.',
      options: [
        { label: 'A', text: 'will hold', translation: 'sẽ tổ chức (chủ động)', isCorrect: false },
        { label: 'B', text: 'will be held', translation: 'sẽ được tổ chức (bị động)', isCorrect: true },
        { label: 'C', text: 'held', translation: 'đã tổ chức', isCorrect: false },
        { label: 'D', text: 'holding', translation: 'đang tổ chức', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Chủ ngữ "The marketing conference" là vật nên phải dùng câu Bị động (be + V3/ed). Có trạng từ thời gian "next Thursday" -> Tương lai bị động.',
      translation: 'Hội nghị tiếp thị sẽ được tổ chức tại Khách sạn Grand Hyatt vào sáng thứ Năm tới.'
    },
    {
      prompt: 'Because of ______ extensive experience in corporate law, Mr. Tanaka was appointed as chief legal counsel.',
      options: [
        { label: 'A', text: 'he', translation: 'anh ấy (chủ ngữ)', isCorrect: false },
        { label: 'B', text: 'him', translation: 'anh ấy (tân ngữ)', isCorrect: false },
        { label: 'C', text: 'his', translation: 'của anh ấy (tính từ sở hữu)', isCorrect: true },
        { label: 'D', text: 'himself', translation: 'chính anh ấy', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Đứng trước cụm danh từ "extensive experience" cần một Tính từ sở hữu "his".',
      translation: 'Nhờ có kinh nghiệm sâu rộng trong lĩnh vực luật doanh nghiệp, ông Tanaka đã được bổ nhiệm làm cố vấn pháp lý trưởng.'
    }
  ];

  const questions = [];
  for (let i = 1; i <= count; i++) {
    const base = sampleBank[(i - 1) % sampleBank.length];
    questions.push({
      questionNumber: i,
      prompt: `[Câu ${i}] ` + base.prompt,
      promptTranslation: base.translation,
      options: base.options,
      correctAnswer: base.correctAnswer,
      explanation: base.explanation,
      translation: base.translation
    });
  }
  return questions;
}

// =========================================================================
// BILINGUAL ARTICLES DEFINITIONS (5 LEVELS x 15 ARTICLES = 75 ARTICLES)
// =========================================================================
const BILINGUAL_ARTICLES = [
  // --- LEVEL 1 (A2) ---
  {
    title: 'Company Lunch Party (E-mail)',
    category: 'E-mail',
    level: 1,
    levelBadge: 'A2',
    readTime: '2 phút',
    audioUrl: 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2026/test1/1.mp3',
    paragraphs: [
      {
        paragraphNum: 1,
        en: 'To all staff members, we are pleased to announce our annual company lunch party this Friday at 12:30 PM in the main banquet hall.',
        vi: 'Gửi toàn thể nhân viên, chúng tôi rất vui mừng thông báo về tiệc trưa thường niên của công ty vào thứ Sáu tuần này lúc 12:30 trưa tại sảnh tiệc chính.'
      },
      {
        paragraphNum: 2,
        en: 'A wide selection of buffet dishes including vegetarian and gluten-free options will be provided free of charge for all employees.',
        vi: 'Một thực đơn tự chọn phong phú bao gồm các món chay và không chứa gluten sẽ được phục vụ miễn phí cho toàn bộ nhân viên.'
      },
      {
        paragraphNum: 3,
        en: 'Please RSVP to Sarah Jenkins in the Human Resources department by Wednesday afternoon so that we can confirm the final headcount with the catering team.',
        vi: 'Vui lòng xác nhận tham dự với Sarah Jenkins tại phòng Nhân sự trước chiều thứ Tư để chúng tôi có thể chốt số lượng người với đội ngũ phục vụ tiệc.'
      }
    ],
    vocabulary: [
      { word: 'annual', pos: 'adj', ipa: '/ˈænjuəl/', meaning: 'thường niên, hằng năm' },
      { word: 'banquet hall', pos: 'n', ipa: '/ˈbæŋkwɪt hɔːl/', meaning: 'sảnh tiệc lớn' },
      { word: 'headcount', pos: 'n', ipa: '/ˈhedkaʊnt/', meaning: 'số lượng người tham gia' }
    ],
    questions: [
      {
        questionNumber: 1,
        prompt: 'What is the main purpose of the email?',
        options: [
          { label: 'A', text: 'To announce an office relocation', translation: 'Thông báo chuyển văn phòng' },
          { label: 'B', text: 'To invite staff to a company lunch party', translation: 'Mời nhân viên dự tiệc trưa công ty' },
          { label: 'C', text: 'To introduce a new HR manager', translation: 'Giới thiệu trưởng phòng nhân sự mới' },
          { label: 'D', text: 'To request catering bids', translation: 'Yêu cầu báo giá dịch vụ tiệc' }
        ],
        correctAnswer: 'B',
        explanation: 'Đoạn 1 nêu rõ mục đích thông báo tiệc trưa thường niên vào thứ Sáu.'
      },
      {
        questionNumber: 2,
        prompt: 'When will the event take place?',
        options: [
          { label: 'A', text: 'On Wednesday morning', translation: 'Sáng thứ Tư' },
          { label: 'B', text: 'On Friday at 12:30 PM', translation: 'Thứ Sáu lúc 12:30 trưa' },
          { label: 'C', text: 'Next week on Monday', translation: 'Thứ Hai tuần tới' },
          { label: 'D', text: 'On Friday evening', translation: 'Tối thứ Sáu' }
        ],
        correctAnswer: 'B',
        explanation: 'Đoạn 1: "this Friday at 12:30 PM".'
      },
      {
        questionNumber: 3,
        prompt: 'What should employees do by Wednesday afternoon?',
        options: [
          { label: 'A', text: 'Submit their timecards', translation: 'Nộp bảng chấm công' },
          { label: 'B', text: 'Pay a registration fee', translation: 'Đóng phí tham gia' },
          { label: 'C', text: 'Confirm their attendance with Sarah Jenkins', translation: 'Xác nhận tham dự với Sarah Jenkins' },
          { label: 'D', text: 'Clean the banquet hall', translation: 'Dọn dẹp sảnh tiệc' }
        ],
        correctAnswer: 'C',
        explanation: 'Đoạn 3: "Please RSVP to Sarah Jenkins in the Human Resources department by Wednesday afternoon".'
      },
      {
        questionNumber: 4,
        prompt: 'What is indicated about the food at the event?',
        options: [
          { label: 'A', text: 'It will be prepared by employees', translation: 'Do nhân viên tự nấu' },
          { label: 'B', text: 'Dietary options like vegetarian will be available', translation: 'Có các lựa chọn ăn kiêng như món chay' },
          { label: 'C', text: 'Employees must purchase tickets', translation: 'Nhân viên phải mua vé' },
          { label: 'D', text: 'It only includes cold snacks', translation: 'Chỉ có đồ ăn nhẹ nguội' }
        ],
        correctAnswer: 'B',
        explanation: 'Đoạn 2: "including vegetarian and gluten-free options".'
      }
    ]
  },
  {
    title: 'Delivery Delay Notice (Memo)',
    category: 'Notice',
    level: 1,
    levelBadge: 'A2',
    readTime: '2 phút',
    paragraphs: [
      {
        paragraphNum: 1,
        en: 'Due to severe weather conditions along the East Coast, shipments scheduled for delivery on October 12 will experience a 24-hour delay.',
        vi: 'Do điều kiện thời tiết khắc nghiệt dọc theo Bờ Đông, các chuyến hàng dự kiến giao vào ngày 12 tháng 10 sẽ bị hoãn 24 giờ.'
      },
      {
        paragraphNum: 2,
        en: 'We apologize for any inconvenience this may cause to your business operations. Our logistics team is working around the clock to expedite all orders.',
        vi: 'Chúng tôi thành thật xin lỗi vì bất kỳ sự bất tiện nào có thể gây ra cho hoạt động kinh doanh của quý khách. Đội ngũ hậu cần của chúng tôi đang làm việc liên tục để đẩy nhanh các đơn hàng.'
      }
    ],
    vocabulary: [
      { word: 'severe', pos: 'adj', ipa: '/sɪˈvɪər/', meaning: 'khắc nghiệt, nghiêm trọng' },
      { word: 'expedite', pos: 'v', ipa: '/ˈekspədaɪt/', meaning: 'xúc tiến, đẩy nhanh tiến độ' }
    ],
    questions: [
      {
        questionNumber: 1,
        prompt: 'Why are deliveries delayed?',
        options: [
          { label: 'A', text: 'A computer system outage', translation: 'Mất hệ thống máy tính' },
          { label: 'B', text: 'Severe weather conditions', translation: 'Thời tiết khắc nghiệt' },
          { label: 'C', text: 'A national holiday', translation: 'Ngày nghỉ lễ' },
          { label: 'D', text: 'A warehouse relocation', translation: 'Chuyển nhà kho' }
        ],
        correctAnswer: 'B',
        explanation: 'Đoạn 1: "Due to severe weather conditions along the East Coast".'
      },
      {
        questionNumber: 2,
        prompt: 'How long is the expected delay?',
        options: [
          { label: 'A', text: '12 hours', translation: '12 giờ' },
          { label: 'B', text: '24 hours', translation: '24 giờ' },
          { label: 'C', text: 'One week', translation: 'Một tuần' },
          { label: 'D', text: 'One month', translation: 'Một tháng' }
        ],
        correctAnswer: 'B',
        explanation: 'Đoạn 1: "will experience a 24-hour delay".'
      }
    ]
  },
  {
    title: 'Holiday Office Closure (Announcement)',
    category: 'Announcement',
    level: 1,
    levelBadge: 'A2',
    readTime: '2 phút',
    paragraphs: [
      {
        paragraphNum: 1,
        en: 'Please be advised that all corporate offices will be closed on Monday, September 2, in observance of Labor Day.',
        vi: 'Xin lưu ý rằng tất cả các văn phòng công ty sẽ đóng cửa vào thứ Hai, ngày 2 tháng 9, nhân dịp Ngày lễ Lao động.'
      },
      {
        paragraphNum: 2,
        en: 'Normal business operations and customer support hotlines will resume at 8:00 AM on Tuesday, September 3.',
        vi: 'Hoạt động kinh doanh bình thường và đường dây nóng hỗ trợ khách hàng sẽ mở lại lúc 8:00 sáng thứ Ba, ngày 3 tháng 9.'
      }
    ],
    questions: [
      {
        questionNumber: 1,
        prompt: 'When will offices reopen?',
        options: [
          { label: 'A', text: 'Monday morning', translation: 'Sáng thứ Hai' },
          { label: 'B', text: 'Tuesday at 8:00 AM', translation: 'Thứ Ba lúc 8:00 sáng' },
          { label: 'C', text: 'Friday evening', translation: 'Tối thứ Sáu' },
          { label: 'D', text: 'Next month', translation: 'Tháng tới' }
        ],
        correctAnswer: 'B',
        explanation: 'Đoạn 2: "resume at 8:00 AM on Tuesday, September 3".'
      }
    ]
  }
];

// Helper to generate full 15 articles per level
function buildFullBilingualArticles() {
  const categories = ['E-mail', 'Memo', 'Announcement', 'Notice', 'Schedule', 'Press Release', 'Newsletter', 'Invoice', 'Business Letter', 'Job Ad'];
  const titles = [
    'Company Lunch Party (E-mail)', 'Delivery Delay Notice (Memo)', 'Holiday Office Closure (Announcement)',
    'Meeting Reschedule Request', 'Office Supplies Order Confirmation', 'Gym Membership Welcome Package',
    'Flight Itinerary and Hotel Booking', 'Restaurant Table Reservation Confirmation', 'Library Weekend Operating Hours',
    'Customer Satisfaction Feedback Survey', 'New Software System Training Workshop', 'Quarterly Revenue Performance Overview',
    'Health Insurance Benefit Policy Updates', 'Warehouse Inventory Audit Schedule', 'Charity Marathon Volunteer Registration'
  ];

  const fullList = [];
  for (let lv = 1; lv <= 5; lv++) {
    const badge = lv === 1 ? 'A2' : lv === 2 ? 'B1' : lv === 3 ? 'B2' : lv === 4 ? 'C1' : 'C2';
    for (let a = 1; a <= 15; a++) {
      const baseTitle = titles[(a - 1) % titles.length] + ` - Level ${lv}`;
      const category = categories[(a - 1) % categories.length];

      fullList.push({
        title: baseTitle,
        category: category,
        level: lv,
        levelBadge: badge,
        readTime: `${2 + lv} phút`,
        audioUrl: `https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2026/test1/${(a % 6) + 1}.mp3`,
        paragraphs: [
          {
            paragraphNum: 1,
            en: `This document outlines official corporate procedures regarding ${baseTitle.toLowerCase()}. All department staff are expected to follow these guidelines carefully.`,
            vi: `Tài liệu này vạch ra các quy trình chính thức của công ty liên quan đến ${baseTitle.toLowerCase()}. Toàn thể nhân viên phòng ban cần tuân thủ nghiêm ngặt các hướng dẫn này.`
          },
          {
            paragraphNum: 2,
            en: 'For any urgent questions or technical assistance, please submit a service ticket through our internal portal or reach out to the project coordinator directly.',
            vi: 'Đối với bất kỳ câu hỏi khẩn cấp hoặc hỗ trợ kỹ thuật nào, vui lòng gửi phiếu yêu cầu qua cổng nội bộ hoặc liên hệ trực tiếp với điều phối viên dự án.'
          }
        ],
        vocabulary: [
          { word: 'procedure', pos: 'n', ipa: '/prəˈsiːdʒər/', meaning: 'quy trình, thủ tục' },
          { word: 'coordinator', pos: 'n', ipa: '/koʊˈɔːrdɪneɪtər/', meaning: 'điều phối viên' }
        ],
        questions: [
          {
            questionNumber: 1,
            prompt: `What is the primary focus of this ${category.toLowerCase()}?`,
            options: [
              { label: 'A', text: 'To outline official procedures and guidelines', translation: 'Nêu các quy trình và hướng dẫn chính thức' },
              { label: 'B', text: 'To announce the retirement of a director', translation: 'Thông báo giám đốc nghỉ hưu' },
              { label: 'C', text: 'To request an emergency loan', translation: 'Yêu cầu khoản vay khẩn cấp' },
              { label: 'D', text: 'To advertise a retail product', translation: 'Quảng cáo sản phẩm bán lẻ' }
            ],
            correctAnswer: 'A',
            explanation: 'Đoạn 1 nêu rõ mục đích thông báo quy trình và hướng dẫn chính thức.'
          },
          {
            questionNumber: 2,
            prompt: 'How can employees get technical assistance?',
            options: [
              { label: 'A', text: 'By submitting an internal service ticket', translation: 'Gửi phiếu yêu cầu dịch vụ nội bộ' },
              { label: 'B', text: 'By visiting a local store', translation: 'Đến cửa hàng địa phương' },
              { label: 'C', text: 'By calling the police', translation: 'Gọi cảnh sát' },
              { label: 'D', text: 'By sending a fax', translation: 'Gửi fax' }
            ],
            correctAnswer: 'A',
            explanation: 'Đoạn 2: "submit a service ticket through our internal portal".'
          }
        ]
      });
    }
  }
  return fullList;
}

// =========================================================================
// MASTER SEED FUNCTION
// =========================================================================
async function seedAllReading() {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log('✅ Connected to MongoDB.');

  // Clear existing grammar, bilingual, and consolidated exercises
  await ReadingExercise.deleteMany({ mode: { $in: ['grammar', 'bilingual', 'consolidated'] } });
  console.log('🗑️ Cleared previous grammar, bilingual & consolidated documents.');

  let totalDocs = 0;
  let totalQuestions = 0;

  // -------------------------------------------------------------------------
  // 1. SEED 16 GRAMMAR TOPICS (THEORY + 40 QUESTIONS EACH)
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('🚀 SEEDING 16 CHUYÊN ĐỀ NGỮ PHÁP TRỌNG ĐIỂM...');
  console.log('======================================================');

  for (const topic of GRAMMAR_TOPICS) {
    const questions = generateGrammarQuestions(topic.title, 40);

    await ReadingExercise.create({
      title: topic.title,
      subTitle: topic.subTitle,
      mode: 'grammar',
      level: topic.level,
      levelBadge: topic.levelBadge,
      topic: topic.title,
      grammarTopic: topic.topicId,
      totalQuestions: questions.length,
      questions: questions,
      grammarTheory: {
        title: topic.title,
        description: topic.subTitle,
        theoryMarkdown: topic.theoryMarkdown,
        rules: topic.rules || []
      }
    });

    totalDocs++;
    totalQuestions += questions.length;
    console.log(`  📘 [Ngữ Pháp] ${topic.title} (${topic.levelBadge}): ${questions.length} câu`);
  }

  // -------------------------------------------------------------------------
  // 2. SEED 20 CONSOLIDATED GRAMMAR TESTS (30 QUESTIONS EACH = 600 QUESTIONS)
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('🚀 SEEDING 20 ĐỀ TỔNG HỢP NGỮ PHÁP (CONSOLIDATED TESTS)...');
  console.log('======================================================');

  for (let t = 1; t <= 20; t++) {
    const testQuestions = generateGrammarQuestions(`Đề tổng hợp #${t}`, 30);

    await ReadingExercise.create({
      title: `Đề tổng hợp #${t}`,
      subTitle: `30 câu kiểm tra ngữ pháp tổng hợp toàn diện (Đề số ${t})`,
      mode: 'consolidated',
      level: Math.ceil(t / 4),
      levelBadge: t <= 5 ? 'A2' : t <= 10 ? 'B1' : t <= 15 ? 'B2' : 'C1',
      topic: `Đề tổng hợp #${t}`,
      totalQuestions: 30,
      questions: testQuestions
    });

    totalDocs++;
    totalQuestions += 30;
    console.log(`  📝 [Đề Tổng Hợp] Đề #${t}: 30 câu trắc nghiệm`);
  }

  // -------------------------------------------------------------------------
  // 3. SEED 75 BILINGUAL ARTICLES (5 LEVELS x 15 ARTICLES)
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log('🚀 SEEDING 75 BÀI ĐỌC SONG NGỮ ANH - VIỆT (5 LEVELS)...');
  console.log('======================================================');

  const allBilingual = buildFullBilingualArticles();
  for (const art of allBilingual) {
    await ReadingExercise.create({
      title: art.title,
      subTitle: `Bài đọc song ngữ trình độ ${art.levelBadge}`,
      mode: 'bilingual',
      level: art.level,
      levelBadge: art.levelBadge,
      articleCategory: art.category,
      readTime: art.readTime,
      audioUrl: art.audioUrl,
      totalQuestions: art.questions.length,
      questions: art.questions.map(q => ({
        questionNumber: q.questionNumber,
        prompt: q.prompt,
        promptTranslation: q.promptTranslation,
        options: q.options.map(opt => ({
          label: opt.label,
          text: opt.text,
          translation: opt.translation,
          isCorrect: opt.label === q.correctAnswer
        })),
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      })),
      bilingualArticle: {
        title: art.title,
        badge: art.levelBadge,
        category: art.category,
        readTime: art.readTime,
        levelText: `Level ${art.level} — ${art.levelBadge}`,
        audioUrl: art.audioUrl,
        paragraphs: art.paragraphs,
        vocabulary: art.vocabulary,
        questions: art.questions
      }
    });

    totalDocs++;
    totalQuestions += art.questions.length;
  }
  console.log(`  📖 [Song Ngữ] Đã nạp thành công 75 bài đọc song ngữ trọn bộ 5 cấp độ!`);

  console.log('\n======================================================');
  console.log('🌟 HOÀN TẤT SEED TOÀN BỘ CÁC MODULE READING!');
  console.log(`📊 Tổng số tài liệu Reading mới nạp: ${totalDocs}`);
  console.log(`📝 Tổng số câu hỏi mới nạp: ${totalQuestions}`);
  console.log('======================================================\n');

  await mongoose.disconnect();
}

seedAllReading()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Lỗi seed reading:', err);
    process.exit(1);
  });
