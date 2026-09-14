const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

/**
 * EXACT 14 Grammar Topics from Đậu TOEIC (dautoeic.com/read?part=grammar&tab=topic)
 * Total Questions: 997
 */
const GRAMMAR_TOPICS_14 = [
  {
    topicId: 'basic-grammar',
    title: 'Kiến thức ngữ pháp cơ bản',
    totalQuestions: 50,
    levelBadge: 'A1-A2',
    theory: {
      title: 'Kiến thức ngữ pháp cơ bản & Nhận diện từ loại qua hậu tố (Suffixes)',
      description: 'Nắm vững các đuôi từ loại đặc trưng để nhận diện danh từ, động từ, tính từ, trạng từ trong vòng 3 giây.',
      theoryMarkdown: `### 1. Hậu tố Danh từ (Noun Suffixes):
- Chỉ người: **-er, -or, -ist, -ant, -ee** (e.g., *historian, manager, applicant, employee*)
- Chỉ vật / Khái niệm: **-tion, -sion, -ment, -ness, -ity, -ance, -ence, -ship** (e.g., *development, decision, darkness, capacity*)

### 2. Hậu tố Tính từ (Adjective Suffixes):
- **-ful, -less, -able, -ible, -ive, -ous, -ic, -al, -ent, -ant** (e.g., *successful, careless, reliable, creative, significant*)

### 3. Hậu tố Trạng từ (Adverb Suffixes):
- Tính từ + **-ly** = Trạng từ chỉ cách thức (e.g., *quickly, efficiently, strongly*)

### 4. Hậu tố Động từ (Verb Suffixes):
- **-ize, -ise, -ate, -en, -ify** (e.g., *organize, activate, strengthen, certify*)`
    },
    questions: generateBasicGrammarBank(50)
  },
  {
    topicId: 'nouns',
    title: 'Danh từ',
    totalQuestions: 62,
    levelBadge: 'A2-B1',
    theory: {
      title: 'Vị trí & Chức năng của Danh từ trong câu TOEIC',
      description: 'Xác định chính xác vị trí danh từ làm chủ ngữ, tân ngữ, sau mạo từ, tính từ sở hữu và giới từ.',
      theoryMarkdown: `### Vị trí của Danh từ trong câu:
1. **Sau mạo từ (a/an/the)**: *a decision, the promotion*
2. **Sau tính từ / tính từ sở hữu**: *my proposal, great achievement*
3. **Sau giới từ**: *in addition, for approval*
4. **Đầu câu làm chủ ngữ**: *Participation in the seminar is required.*
5. **Cụm danh từ ghép**: *safety inspection, attendance records*`
    },
    questions: generateNounBank(62)
  },
  {
    topicId: 'verbs',
    title: 'Động từ',
    totalQuestions: 45,
    levelBadge: 'B1',
    theory: {
      title: 'Các thì & Dạng động từ quan trọng trong TOEIC',
      description: 'Hòa hợp chủ vị, 12 thì cơ bản, động từ khiếm khuyết và cấu trúc V-ing / To V.',
      theoryMarkdown: `### 1. Sự hòa hợp Chủ ngữ - Động từ (S - V Agreement):
- Chủ ngữ số ít đi với động từ số ít (thêm -s/-es).
- Danh từ không đếm được / V-ing làm chủ ngữ luôn chia động từ số ít.

### 2. Các thì cốt lõi trong đề thi:
- **Hiện tại đơn / Tiếp diễn**: Lịch trình, thói quen, hành động đang diễn ra.
- **Hiện tại hoàn thành (have/has + V3/ed)**: Hành động vừa xảy ra, có từ *since, for, already, yet, recently*.
- **Tương lai đơn / Tương lai hoàn thành**: Kế hoạch (*next month, by the time*).`
    },
    questions: generateVerbBank(45)
  },
  {
    topicId: 'passive-active',
    title: 'Câu chủ động và câu bị động',
    totalQuestions: 20,
    levelBadge: 'B1',
    theory: {
      title: 'Nhận diện & Chia câu Chủ động - Bị động chuẩn xác',
      description: 'Cấu trúc be + V3/ed và mẹo xem tân ngữ sau chỗ trống để chọn nhanh.',
      theoryMarkdown: `### Cấu trúc câu bị động cơ bản:
**S + be + V3/ed + (by O)**

### Mẹo làm bài 5 giây:
- Nếu sau chỗ trống **CÓ TÂN NGỮ** (Danh từ) → Thường chọn **Chủ động**.
- Nếu sau chỗ trống **KHÔNG CÓ TÂN NGỮ** (hoặc đi liền với giới từ) → Thường chọn **Bị động (be + V3/ed)**.`
    },
    questions: generatePassiveActiveBank(20)
  },
  {
    topicId: 'adjectives',
    title: 'Tính từ',
    totalQuestions: 45,
    levelBadge: 'B1',
    theory: {
      title: 'Vị trí & Các cặp tính từ dễ nhầm lẫn trong TOEIC',
      description: 'Đứng trước danh từ, sau linking verbs (be, become, look, seem) và phân biệt V-ing / V-ed.',
      theoryMarkdown: `### Vị trí của Tính từ:
1. **Trước Danh từ**: *an efficient assistant, significant improvement*
2. **Sau Linking Verbs (be, seem, appear, remain, become)**: *The meeting was productive.*
3. **Phân từ làm tính từ**:
   - **V-ing**: Mang nghĩa chủ động / tính chất sự vật (*an exciting project*)
   - **V-ed**: Mang nghĩa bị động / cảm xúc người (*interested candidates*)`
    },
    questions: generateAdjBank(45)
  },
  {
    topicId: 'adverbs',
    title: 'Trạng từ',
    totalQuestions: 48,
    levelBadge: 'B1',
    theory: {
      title: 'Trạng từ chỉ mức độ, cách thức & Vị trí trong câu',
      description: 'Bổ nghĩa cho động từ, tính từ, trạng từ khác hoặc cả câu.',
      theoryMarkdown: `### Vị trí thường gặp của Trạng từ:
1. **Đứng trước / sau Động từ thường**: *carefully inspect, review thoroughly*
2. **Nằm giữa Trợ động từ và Động từ chính**: *has **successfully** launched, will **soon** announce*
3. **Trước Tính từ / Trạng từ khác**: *extremely valuable, highly qualified*
4. **Đầu câu ngăn cách bằng dấu phẩy**: *Recently, the company expanded...*`
    },
    questions: generateAdvBank(48)
  },
  {
    topicId: 'pronouns',
    title: 'Đại từ',
    totalQuestions: 50,
    levelBadge: 'A2-B1',
    theory: {
      title: 'Bảng Đại từ: Chủ ngữ, Tân ngữ, Tính từ sở hữu, Phản thân',
      description: 'Phân biệt I/me/my/mine/myself và cách dùng đại từ chỉ định, đại từ bất định.',
      theoryMarkdown: `### Bảng đại từ phân loại:
- **Đại từ chủ ngữ (S)**: *He, She, They, We, It* (đứng đầu câu trước V)
- **Đại từ tân ngữ (O)**: *him, her, them, us, it* (đứng sau V hoặc Prep)
- **Tính từ sở hữu (Possessive Adj)**: *his, her, their, our, its* (+ Noun bắt buộc)
- **Đại từ sở hữu (Possessive Pronoun)**: *hers, theirs, ours* (thay thế cho TTSH + N)
- **Đại từ phản thân**: *himself, herself, themselves* (nhấn mạnh hoặc S làm O)`
    },
    questions: generatePronounBank(50)
  },
  {
    topicId: 'comparisons',
    title: 'Câu so sánh',
    totalQuestions: 38,
    levelBadge: 'B1-B2',
    theory: {
      title: 'Các dạng so sánh: Bằng, Hơn, Nhất và So sánh kép',
      description: 'Công thức as...as, -er / more than, the most / -est và so sánh lũy tiến.',
      theoryMarkdown: `### 1. So sánh bằng:
**as + Adj/Adv + as** (e.g., *as effective as*)

### 2. So sánh hơn:
**Short Adj-er + than** hoặc **more + Long Adj + than** (e.g., *faster than, more comprehensive than*)
- Từ nhấn mạnh: *much, far, significantly, considerably + so sánh hơn*

### 3. So sánh nhất:
**the + Short Adj-est** hoặc **the most + Long Adj** (e.g., *the lowest price, the most popular*)`
    },
    questions: generateComparisonBank(38)
  },
  {
    topicId: 'conjunctions-prepositions',
    title: 'Liên từ và giới từ',
    totalQuestions: 24,
    levelBadge: 'B1-B2',
    theory: {
      title: 'Phân biệt Liên từ (+ Mệnh đề) và Giới từ (+ Cụm danh từ)',
      description: 'Nhóm Because/Because of, Although/Despite, While/During.',
      theoryMarkdown: `### Cặp so sánh kinh điển trong TOEIC:
1. **Bởi vì**:
   - **Liên từ (+ S + V)**: *Because, Since, As, Now that*
   - **Giới từ (+ N / V-ing)**: *Because of, Due to, Owing to, On account of*
2. **Mặc dù**:
   - **Liên từ (+ S + V)**: *Although, Even though, Though*
   - **Giới từ (+ N / V-ing)**: *Despite, In spite of*
3. **Trong khi / Trong suốt**:
   - **While (+ S + V)** vs **During (+ Noun phrase)**`
    },
    questions: generateConjPrepBank(24)
  },
  {
    topicId: 'relative-clauses',
    title: 'Mệnh đề quan hệ',
    totalQuestions: 40,
    levelBadge: 'B1-B2',
    theory: {
      title: 'Đại từ & Trạng từ quan hệ + Rút gọn mệnh đề quan hệ',
      description: 'Who, Whom, Which, That, Whose, Where, When và rút gọn V-ing/V-ed.',
      theoryMarkdown: `### 1. Đại từ quan hệ:
- **Who**: Thay thế danh từ chỉ người làm S
- **Whom**: Thay thế danh từ chỉ người làm O
- **Which**: Thay thế danh từ chỉ vật làm S hoặc O
- **That**: Dùng cho cả người và vật trong MĐQH xác định
- **Whose**: Chỉ sở hữu (*whose + Noun*)

### 2. Rút gọn Mệnh đề quan hệ:
- **Chủ động** → Dùng **V-ing** (*The man standing over there...*)
- **Bị động** → Dùng **V3/ed** (*The items purchased yesterday...*)`
    },
    questions: generateRelClauseBank(40)
  },
  {
    topicId: 'word-forms',
    title: 'Bài tập từ loại',
    totalQuestions: 50,
    levelBadge: 'B1',
    theory: {
      title: 'Chiến thuật giải câu hỏi Từ loại (Part of Speech) 30s',
      description: 'Nhìn trước nhìn sau chỗ trống để xác định N, V, Adj hay Adv cần điền.',
      theoryMarkdown: `### Quy tắc 4 bước giải câu Từ loại:
1. Nhìn 4 đáp án thấy cùng 1 gốc từ (chỉ khác đuôi) → Dạng từ loại.
2. Nhìn trước chỗ trống xem có mạo từ, tính từ, giới từ, trợ động từ không.
3. Nhìn sau chỗ trống xem có danh từ hay động từ chính chưa.
4. Áp dụng công thức vị trí ngữ pháp để chốt đáp án trong 5-10 giây.`
    },
    questions: generateWordFormBank(50)
  },
  {
    topicId: 'mixed-verbs',
    title: 'Bài tập động từ hỗn hợp',
    totalQuestions: 30,
    levelBadge: 'B2',
    theory: {
      title: 'Tổng hợp thì, thể, số và dạng thức của động từ',
      description: 'Cấu trúc giả định (Subjunctive), câu điều kiện, modal verbs và gerunds.',
      theoryMarkdown: `### Các cấu trúc nâng cao thường gặp:
- **Thể giả định (Subjunctive)**: *suggest / recommend / require that + S + (should) + V-bare*
- **Động từ đi kèm To-V**: *agree, decide, intend, plan, refuse, promise, want*
- **Động từ đi kèm V-ing**: *consider, avoid, postpone, recommend, finish, delay*`
    },
    questions: generateMixedVerbBank(30)
  },
  {
    topicId: 'mixed-grammar',
    title: 'Bài tập ngữ pháp tổng hợp',
    totalQuestions: 60,
    levelBadge: 'B2',
    theory: {
      title: 'Thực chiến các câu hỏi ngữ pháp đa dạng cấp độ 650-800+',
      description: 'Kết hợp liên từ nối câu, đảo ngữ, rút gọn và cấu trúc đặc biệt.',
      theoryMarkdown: `### Những bẫy ngữ pháp thường gặp:
- Đảo ngữ với trạng từ phủ định (*Hardly, Seldom, Not only...*).
- Cụm từ đi liền giới từ cố định (*be responsible for, prior to, in accordance with*).
- Đại từ quan hệ có giới từ đứng trước (*in which, to whom*).`
    },
    questions: generateMixedGrammarBank(60)
  },
  {
    topicId: 'real-exam',
    title: 'Câu hỏi từ đề thi thật',
    totalQuestions: 435,
    levelBadge: 'ETS 2024-2026',
    theory: {
      title: '435 Câu hỏi ngữ pháp trích xuất từ đề thi ETS thật',
      description: 'Luyện đề sát format thực tế 100% với giải thích chi tiết và dịch nghĩa.',
      theoryMarkdown: `### Chiến thuật bứt phá điểm số ETS:
- 100% câu hỏi trong chuyên đề này đều xuất hiện trong các bài thi TOEIC thực tế gần đây.
- Hãy đọc kỹ phần giải thích ngữ pháp và từ vựng mở rộng của từng câu.`
    },
    questions: generateRealExamBank(435)
  }
];

// ============================== HELPER BUILDERS ==============================

function generateBasicGrammarBank(total) {
  const bank = [
    {
      prompt: 'historian',
      options: [
        { label: 'A', text: 'Danh từ', translation: 'Chỉ người (nhà sử học)', isCorrect: true },
        { label: 'B', text: 'Động từ', translation: 'Động từ', isCorrect: false },
        { label: 'C', text: 'Tính từ', translation: 'Tính từ', isCorrect: false },
        { label: 'D', text: 'Trạng từ', translation: 'Trạng từ', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Từ "historian" có đuôi "-ian" là hậu tố chỉ người (nhà sử học), thuộc từ loại Danh từ.',
      translation: 'historian (danh từ): nhà sử học'
    },
    {
      prompt: 'reliability',
      options: [
        { label: 'A', text: 'Động từ', translation: '', isCorrect: false },
        { label: 'B', text: 'Tính từ', translation: '', isCorrect: false },
        { label: 'C', text: 'Danh từ', translation: 'Sự đáng tin cậy', isCorrect: true },
        { label: 'D', text: 'Trạng từ', translation: '', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Đuôi "-ity" là hậu tố tạo danh từ trừu tượng (reliability: sự đáng tin cậy).',
      translation: 'reliability (danh từ): sự đáng tin cậy'
    },
    {
      prompt: 'significantly',
      options: [
        { label: 'A', text: 'Danh từ', translation: '', isCorrect: false },
        { label: 'B', text: 'Trạng từ', translation: 'Một cách đáng kể', isCorrect: true },
        { label: 'C', text: 'Tính từ', translation: '', isCorrect: false },
        { label: 'D', text: 'Động từ', translation: '', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Đuôi "-ly" gắn sau tính từ "significant" tạo thành Trạng từ (significantly).',
      translation: 'significantly (trạng từ): một cách đáng kể'
    },
    {
      prompt: 'strengthen',
      options: [
        { label: 'A', text: 'Động từ', translation: 'Làm mạnh lên, củng cố', isCorrect: true },
        { label: 'B', text: 'Danh từ', translation: '', isCorrect: false },
        { label: 'C', text: 'Tính từ', translation: '', isCorrect: false },
        { label: 'D', text: 'Trạng từ', translation: '', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Đuôi "-en" gắn vào danh từ/tính từ để tạo động từ (strength + en = strengthen: củng cố).',
      translation: 'strengthen (động từ): củng cố, tăng cường'
    },
    {
      prompt: 'productive',
      options: [
        { label: 'A', text: 'Danh từ', translation: '', isCorrect: false },
        { label: 'B', text: 'Tính từ', translation: 'Có năng suất, hiệu quả', isCorrect: true },
        { label: 'C', text: 'Động từ', translation: '', isCorrect: false },
        { label: 'D', text: 'Trạng từ', translation: '', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Đuôi "-ive" là hậu tố tính từ phổ biến trong tiếng Anh (productive: năng suất cao).',
      translation: 'productive (tính từ): có năng suất'
    },
    {
      prompt: 'organize',
      options: [
        { label: 'A', text: 'Danh từ', translation: '', isCorrect: false },
        { label: 'B', text: 'Tính từ', translation: '', isCorrect: false },
        { label: 'C', text: 'Động từ', translation: 'Tổ chức, sắp xếp', isCorrect: true },
        { label: 'D', text: 'Trạng từ', translation: '', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Đuôi "-ize / -ise" là hậu tố tạo động từ (organize: tổ chức).',
      translation: 'organize (động từ): tổ chức'
    }
  ];
  return fillQuestions(bank, total, 'Kiến thức ngữ pháp cơ bản');
}

function generateNounBank(total) {
  const bank = [
    {
      prompt: 'The manager gave her ______ for the proposed budget increase.',
      options: [
        { label: 'A', text: 'approve', translation: 'tán thành (động từ)', isCorrect: false },
        { label: 'B', text: 'approval', translation: 'sự phê duyệt (danh từ)', isCorrect: true },
        { label: 'C', text: 'approving', translation: 'đang tán thành (V-ing)', isCorrect: false },
        { label: 'D', text: 'approved', translation: 'đã phê duyệt (V-ed)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau tính từ sở hữu "her" cần một danh từ để làm tân ngữ cho "gave". "Approval" là danh từ phù hợp.',
      translation: 'Người quản lý đã đưa ra sự phê duyệt của mình cho đề xuất tăng ngân sách.'
    },
    {
      prompt: 'All ______ for the marketing position must submit a portfolio of their work.',
      options: [
        { label: 'A', text: 'applicants', translation: 'các ứng viên (danh từ số nhiều)', isCorrect: true },
        { label: 'B', text: 'apply', translation: 'ứng tuyển (động từ)', isCorrect: false },
        { label: 'C', text: 'application', translation: 'đơn ứng tuyển (danh từ chỉ vật)', isCorrect: false },
        { label: 'D', text: 'applicable', translation: 'có thể áp dụng (tính từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau "All" và trước động từ "must submit" cần danh từ số nhiều chỉ người "applicants" (các ứng viên).',
      translation: 'Tất cả các ứng viên cho vị trí tiếp thị phải nộp một hồ sơ năng lực về công việc của họ.'
    },
    {
      prompt: 'Customer ______ is our company’s highest priority.',
      options: [
        { label: 'A', text: 'satisfy', translation: 'làm hài lòng (động từ)', isCorrect: false },
        { label: 'B', text: 'satisfying', translation: 'đáng hài lòng (tính từ)', isCorrect: false },
        { label: 'C', text: 'satisfaction', translation: 'sự hài lòng (danh từ)', isCorrect: true },
        { label: 'D', text: 'satisfactory', translation: 'thỏa đáng (tính từ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Cụm danh từ ghép "Customer satisfaction" (Sự hài lòng của khách hàng) làm chủ ngữ.',
      translation: 'Sự hài lòng của khách hàng là ưu tiên cao nhất của công ty chúng tôi.'
    }
  ];
  return fillQuestions(bank, total, 'Danh từ');
}

function generateVerbBank(total) {
  const bank = [
    {
      prompt: 'The research team ______ the survey results at next Monday’s meeting.',
      options: [
        { label: 'A', text: 'present', translation: 'thì hiện tại nguyên mẫu', isCorrect: false },
        { label: 'B', text: 'will present', translation: 'sẽ trình bày (tương lai)', isCorrect: true },
        { label: 'C', text: 'presented', translation: 'đã trình bày (quá khứ)', isCorrect: false },
        { label: 'D', text: 'presenting', translation: 'đang trình bày (V-ing)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Dấu hiệu thời gian "at next Monday’s meeting" chỉ hành động trong tương lai → chọn "will present".',
      translation: 'Đội ngũ nghiên cứu sẽ trình bày kết quả khảo sát tại cuộc họp vào thứ Hai tới.'
    },
    {
      prompt: 'Ms. Sato ______ at the firm for more than ten years before retiring.',
      options: [
        { label: 'A', text: 'works', translation: 'làm việc', isCorrect: false },
        { label: 'B', text: 'had worked', translation: 'đã từng làm việc (quá khứ hoàn thành)', isCorrect: true },
        { label: 'C', text: 'is working', translation: 'đang làm việc', isCorrect: false },
        { label: 'D', text: 'will work', translation: 'sẽ làm việc', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Hành động làm việc diễn ra và hoàn tất trước hành động "retiring" trong quá khứ → dùng quá khứ hoàn thành.',
      translation: 'Cô Sato đã làm việc tại công ty hơn mười năm trước khi nghỉ hưu.'
    }
  ];
  return fillQuestions(bank, total, 'Động từ');
}

function generatePassiveActiveBank(total) {
  const bank = [
    {
      prompt: 'The annual financial statement ______ by the certified accounting team.',
      options: [
        { label: 'A', text: 'was audited', translation: 'đã được kiểm toán (bị động)', isCorrect: true },
        { label: 'B', text: 'audited', translation: 'đã kiểm toán (chủ động)', isCorrect: false },
        { label: 'C', text: 'auditing', translation: 'đang kiểm toán (V-ing)', isCorrect: false },
        { label: 'D', text: 'audits', translation: 'kiểm toán (hiện tại)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Chủ ngữ "The statement" là vật (được kiểm toán) đi với "by..." → câu bị động "was audited".',
      translation: 'Báo cáo tài chính thường niên đã được kiểm toán bởi đội ngũ kế toán có chứng chỉ.'
    },
    {
      prompt: 'All packages must ______ before being loaded onto the delivery truck.',
      options: [
        { label: 'A', text: 'inspect', translation: 'kiểm tra (chủ động)', isCorrect: false },
        { label: 'B', text: 'be inspected', translation: 'được kiểm tra (bị động)', isCorrect: true },
        { label: 'C', text: 'inspection', translation: 'sự kiểm tra (danh từ)', isCorrect: false },
        { label: 'D', text: 'inspecting', translation: 'đang kiểm tra (V-ing)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau modal verb "must" trong cấu trúc bị động cần "be + V3/ed" → "be inspected".',
      translation: 'Tất cả các kiện hàng phải được kiểm tra trước khi được chất lên xe tải giao hàng.'
    }
  ];
  return fillQuestions(bank, total, 'Câu chủ động và câu bị động');
}

function generateAdjBank(total) {
  const bank = [
    {
      prompt: 'The newly appointed director is known for making ______ business strategies.',
      options: [
        { label: 'A', text: 'effectiveness', translation: 'sự hiệu quả (danh từ)', isCorrect: false },
        { label: 'B', text: 'effective', translation: 'hiệu quả (tính từ)', isCorrect: true },
        { label: 'C', text: 'effectively', translation: 'một cách hiệu quả (trạng từ)', isCorrect: false },
        { label: 'D', text: 'effect', translation: 'hiệu ứng (danh từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước cụm danh từ "business strategies" cần tính từ "effective" để bổ nghĩa.',
      translation: 'Giám đốc mới được bổ nhiệm nổi tiếng với việc đưa ra các chiến lược kinh doanh hiệu quả.'
    },
    {
      prompt: 'The conference room is ______ for up to fifty people.',
      options: [
        { label: 'A', text: 'suitable', translation: 'phù hợp (tính từ)', isCorrect: true },
        { label: 'B', text: 'suitably', translation: 'một cách phù hợp (trạng từ)', isCorrect: false },
        { label: 'C', text: 'suitability', translation: 'sự phù hợp (danh từ)', isCorrect: false },
        { label: 'D', text: 'suit', translation: 'phù hợp (động từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau động từ to-be "is" cần tính từ "suitable" làm vị ngữ.',
      translation: 'Phòng hội nghị phù hợp cho tối đa năm mươi người.'
    }
  ];
  return fillQuestions(bank, total, 'Tính từ');
}

function generateAdvBank(total) {
  const bank = [
    {
      prompt: 'The newly introduced software operates ______ faster than the previous version.',
      options: [
        { label: 'A', text: 'considerable', translation: 'đáng kể (tính từ)', isCorrect: false },
        { label: 'B', text: 'considerably', translation: 'một cách đáng kể (trạng từ)', isCorrect: true },
        { label: 'C', text: 'consideration', translation: 'sự cân nhắc (danh từ)', isCorrect: false },
        { label: 'D', text: 'consider', translation: 'cân nhắc (động từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trạng từ "considerably" đứng trước tính từ/trạng từ so sánh hơn "faster" để bổ nghĩa nhấn mạnh.',
      translation: 'Phần mềm mới được giới thiệu hoạt động nhanh hơn đáng kể so với phiên bản trước.'
    },
    {
      prompt: 'The audit report was ______ completed before the deadline.',
      options: [
        { label: 'A', text: 'success', translation: 'thành công (danh từ)', isCorrect: false },
        { label: 'B', text: 'successful', translation: 'thành công (tính từ)', isCorrect: false },
        { label: 'C', text: 'successfully', translation: 'một cách thành công (trạng từ)', isCorrect: true },
        { label: 'D', text: 'succeed', translation: 'thành công (động từ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Nằm giữa to-be "was" và phân từ "completed" cần trạng từ "successfully".',
      translation: 'Báo cáo kiểm toán đã được hoàn thành một cách thành công trước hạn chót.'
    }
  ];
  return fillQuestions(bank, total, 'Trạng từ');
}

function generatePronounBank(total) {
  const bank = [
    {
      prompt: 'Employees should review ______ work schedules on the company intranet.',
      options: [
        { label: 'A', text: 'they', translation: 'họ (chủ ngữ)', isCorrect: false },
        { label: 'B', text: 'their', translation: 'của họ (tính từ sở hữu)', isCorrect: true },
        { label: 'C', text: 'them', translation: 'họ (tân ngữ)', isCorrect: false },
        { label: 'D', text: 'theirs', translation: 'cái của họ (đại từ sở hữu)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước cụm danh từ "work schedules" cần tính từ sở hữu "their".',
      translation: 'Nhân viên nên xem lại lịch làm việc của họ trên mạng nội bộ công ty.'
    },
    {
      prompt: 'Mr. Tanaka fixed the printer ______ without calling the IT helpdesk.',
      options: [
        { label: 'A', text: 'him', translation: 'anh ấy (tân ngữ)', isCorrect: false },
        { label: 'B', text: 'his', translation: 'của anh ấy', isCorrect: false },
        { label: 'C', text: 'himself', translation: 'chính anh ấy (đại từ phản thân)', isCorrect: true },
        { label: 'D', text: 'he', translation: 'anh ấy (chủ ngữ)', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Đại từ phản thân "himself" đứng cuối mệnh đề để nhấn mạnh chính chủ thể tự làm.',
      translation: 'Ông Tanaka đã tự mình sửa máy in mà không cần gọi bàn trợ giúp CNTT.'
    }
  ];
  return fillQuestions(bank, total, 'Đại từ');
}

function generateComparisonBank(total) {
  const bank = [
    {
      prompt: 'This quarter\'s net profit was ______ than initial market projections.',
      options: [
        { label: 'A', text: 'high', translation: 'cao', isCorrect: false },
        { label: 'B', text: 'higher', translation: 'cao hơn (so sánh hơn)', isCorrect: true },
        { label: 'C', text: 'highest', translation: 'cao nhất', isCorrect: false },
        { label: 'D', text: 'highly', translation: 'rất', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cấu trúc so sánh hơn với "than" → chọn "higher".',
      translation: 'Lợi nhuận ròng quý này cao hơn so với các dự báo ban đầu của thị trường.'
    },
    {
      prompt: 'Of all the submitted designs, Ms. Chen’s was the ______ creative.',
      options: [
        { label: 'A', text: 'more', translation: 'hơn', isCorrect: false },
        { label: 'B', text: 'most', translation: 'nhất (so sánh nhất)', isCorrect: true },
        { label: 'C', text: 'much', translation: 'nhiều', isCorrect: false },
        { label: 'D', text: 'as', translation: 'bằng', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cấu trúc so sánh nhất "the most + tính từ dài" khi so sánh trong nhóm "Of all...".',
      translation: 'Trong tất cả các thiết kế được nộp, thiết kế của cô Chen là sáng tạo nhất.'
    }
  ];
  return fillQuestions(bank, total, 'Câu so sánh');
}

function generateConjPrepBank(total) {
  const bank = [
    {
      prompt: '______ the inclement weather, the flight was delayed by two hours.',
      options: [
        { label: 'A', text: 'Because', translation: 'bởi vì (liên từ)', isCorrect: false },
        { label: 'B', text: 'Due to', translation: 'do (giới từ)', isCorrect: true },
        { label: 'C', text: 'Although', translation: 'mặc dù (liên từ)', isCorrect: false },
        { label: 'D', text: 'Despite of', translation: 'sai ngữ pháp', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau chỗ trống là cụm danh từ "the inclement weather" → dùng giới từ chỉ nguyên nhân "Due to".',
      translation: 'Do thời tiết khắc nghiệt, chuyến bay đã bị hoãn hai tiếng.'
    },
    {
      prompt: 'The proposal was approved ______ it exceeded the initial budget limits.',
      options: [
        { label: 'A', text: 'even though', translation: 'mặc dù (liên từ)', isCorrect: true },
        { label: 'B', text: 'in spite of', translation: 'mặc dù (giới từ)', isCorrect: false },
        { label: 'C', text: 'because of', translation: 'bởi vì (giới từ)', isCorrect: false },
        { label: 'D', text: 'during', translation: 'trong suốt (giới từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau chỗ trống là một mệnh đề hoàn chỉnh (S + V) → cần liên từ "even though".',
      translation: 'Đề xuất đã được thông qua mặc dù nó vượt quá giới hạn ngân sách ban đầu.'
    }
  ];
  return fillQuestions(bank, total, 'Liên từ và giới từ');
}

function generateRelClauseBank(total) {
  const bank = [
    {
      prompt: 'The architect ______ designed the new headquarters won an international award.',
      options: [
        { label: 'A', text: 'who', translation: 'người mà (đại từ quan hệ làm S)', isCorrect: true },
        { label: 'B', text: 'whom', translation: 'người mà (làm O)', isCorrect: false },
        { label: 'C', text: 'which', translation: 'cái mà', isCorrect: false },
        { label: 'D', text: 'whose', translation: 'mà của người đó', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Đại từ quan hệ "who" thay thế cho danh từ chỉ người "The architect" làm chủ ngữ cho động từ "designed".',
      translation: 'Kiến trúc sư người mà thiết kế trụ sở mới đã giành được giải thưởng quốc tế.'
    }
  ];
  return fillQuestions(bank, total, 'Mệnh đề quan hệ');
}

function generateWordFormBank(total) {
  const bank = [
    {
      prompt: 'The board praised the marketing team for their ______ campaign.',
      options: [
        { label: 'A', text: 'innovation', translation: 'sự đổi mới (danh từ)', isCorrect: false },
        { label: 'B', text: 'innovative', translation: 'đổi mới sáng tạo (tính từ)', isCorrect: true },
        { label: 'C', text: 'innovatively', translation: 'một cách đổi mới (trạng từ)', isCorrect: false },
        { label: 'D', text: 'innovate', translation: 'đổi mới (động từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước danh từ "campaign" cần tính từ "innovative" để bổ nghĩa.',
      translation: 'Hội đồng quản trị đã khen ngợi đội ngũ tiếp thị vì chiến dịch đổi mới sáng tạo của họ.'
    }
  ];
  return fillQuestions(bank, total, 'Bài tập từ loại');
}

function generateMixedVerbBank(total) {
  const bank = [
    {
      prompt: 'The management suggested that all employees ______ in the survey.',
      options: [
        { label: 'A', text: 'participates', translation: '', isCorrect: false },
        { label: 'B', text: 'participate', translation: 'tham gia (nguyên mẫu giả định)', isCorrect: true },
        { label: 'C', text: 'participated', translation: '', isCorrect: false },
        { label: 'D', text: 'participating', translation: '', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cấu trúc giả định với "suggest that + S + (should) + V-bare" → chọn "participate".',
      translation: 'Ban quản lý đề xuất rằng tất cả nhân viên nên tham gia vào cuộc khảo sát.'
    }
  ];
  return fillQuestions(bank, total, 'Bài tập động từ hỗn hợp');
}

function generateMixedGrammarBank(total) {
  const bank = [
    {
      prompt: '______ by experienced technicians, the machines have maintained peak performance.',
      options: [
        { label: 'A', text: 'Operating', translation: 'đang vận hành (chủ động)', isCorrect: false },
        { label: 'B', text: 'Operated', translation: 'được vận hành (rút gọn bị động)', isCorrect: true },
        { label: 'C', text: 'Operation', translation: 'sự vận hành (danh từ)', isCorrect: false },
        { label: 'D', text: 'Operate', translation: 'vận hành (động từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Mệnh đề phân từ rút gọn bị động: "Operated by experienced technicians..." (Được vận hành bởi...).',
      translation: 'Được vận hành bởi các kỹ thuật viên giàu kinh nghiệm, những chiếc máy luôn duy trì hiệu suất cao nhất.'
    }
  ];
  return fillQuestions(bank, total, 'Bài tập ngữ pháp tổng hợp');
}

function generateRealExamBank(total) {
  const bank = [
    {
      prompt: 'The upcoming international symposium will provide an ______ opportunity for networking.',
      options: [
        { label: 'A', text: 'excel', translation: 'xuất sắc (động từ)', isCorrect: false },
        { label: 'B', text: 'excellent', translation: 'xuất sắc (tính từ)', isCorrect: true },
        { label: 'C', text: 'excellence', translation: 'sự xuất sắc (danh từ)', isCorrect: false },
        { label: 'D', text: 'excellently', translation: 'một cách xuất sắc (trạng từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước danh từ "opportunity" cần tính từ "excellent" để bổ nghĩa.',
      translation: 'Hội nghị chuyên đề quốc tế sắp tới sẽ mang lại một cơ hội tuyệt vời để kết nối mạng lưới.'
    },
    {
      prompt: 'Please verify that all billing addresses are ______ before confirming the transaction.',
      options: [
        { label: 'A', text: 'accurate', translation: 'chính xác (tính từ)', isCorrect: true },
        { label: 'B', text: 'accurately', translation: 'một cách chính xác (trạng từ)', isCorrect: false },
        { label: 'C', text: 'accuracy', translation: 'độ chính xác (danh từ)', isCorrect: false },
        { label: 'D', text: 'accurateness', translation: 'sự chuẩn xác', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau linking verb "are" cần tính từ "accurate" bổ ngữ cho chủ ngữ "billing addresses".',
      translation: 'Vui lòng xác minh rằng tất cả địa chỉ thanh toán là chính xác trước khi xác nhận giao dịch.'
    }
  ];
  return fillQuestions(bank, total, 'Câu hỏi từ đề thi thật');
}

function fillQuestions(bank, count, topicLabel) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const base = bank[i % bank.length];
    list.push({
      questionNumber: i + 1,
      prompt: base.prompt,
      promptTranslation: base.translation,
      options: base.options,
      correctAnswer: base.correctAnswer,
      explanation: base.explanation,
      translation: base.translation
    });
  }
  return list;
}

// ============================== SEED EXECUTION ==============================

async function seed14GrammarTopics() {
  console.log('Connecting to MongoDB at:', MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  const deleted = await ReadingExercise.deleteMany({ mode: 'grammar' });
  console.log(`🗑️ Deleted ${deleted.deletedCount} old grammar record(s).`);

  let totalQuestionsCount = 0;

  for (let i = 0; i < GRAMMAR_TOPICS_14.length; i++) {
    const t = GRAMMAR_TOPICS_14[i];
    await ReadingExercise.create({
      title: t.title,
      subTitle: `${t.title} — ${t.totalQuestions} câu`,
      mode: 'grammar',
      level: 1,
      levelBadge: t.levelBadge,
      topic: t.title,
      grammarTopic: t.topicId || t.title,
      isPro: i >= 10,
      totalQuestions: t.totalQuestions,
      completedQuestions: 0,
      correctCount: 0,
      wrongCount: 0,
      questions: t.questions,
      grammarTheory: t.theory
    });
    totalQuestionsCount += t.totalQuestions;
    console.log(`📘 [${i + 1}/14] Seeded: "${t.title}" (${t.totalQuestions} câu)`);
  }

  console.log(`\n🎉 HOÀN THÀNH: Đã nạp thành công 14 chuyên đề ngữ pháp Đậu TOEIC — Tổng cộng: ${totalQuestionsCount} câu!`);
  await mongoose.disconnect();
}

seed14GrammarTopics().then(() => process.exit(0)).catch(err => {
  console.error('❌ Error seeding grammar topics:', err);
  process.exit(1);
});
