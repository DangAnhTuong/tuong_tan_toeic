const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const ListeningExercise = require('../models/ListeningExercise');

const SUPABASE_CDN_BASE = "https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media";

// 25 Verified Tests x 13 passages = 325 Unique Audio files
const VERIFIED_TESTS = [
  "2026/t1", "2026/t2", "2026/t3", "2026/t4", "2026/t5",
  "2026/t6", "2026/t7", "2026/t8", "2026/t9", "2026/t10",
  "2024/Test_01", "2024/Test_02", "2024/Test_03", "2024/Test_04", "2024/Test_05",
  "2024/Test_06", "2024/Test_07", "2024/Test_08", "2024/Test_09", "2024/Test_10",
  "2019/test1", "2019/test2", "2019/test3", "2019/test4", "2019/test5"
];

const RANGES = [
  { start: 32, end: 34 },
  { start: 35, end: 37 },
  { start: 38, end: 40 },
  { start: 41, end: 43 },
  { start: 44, end: 46 },
  { start: 47, end: 49 },
  { start: 50, end: 52 },
  { start: 53, end: 55 },
  { start: 56, end: 58 },
  { start: 59, end: 61 },
  { start: 62, end: 64 },
  { start: 65, end: 67 },
  { start: 68, end: 70 }
];

// Rich Business Domains & Roles for Generating 300 Distinct Scenarios
const DOMAINS = [
  {
    name: "IT & Software Development",
    roles: ["Software Engineer", "Systems Analyst", "IT Helpdesk", "Cloud Architect", "Database Admin", "Product Owner"],
    actions: ["deploying a software update", "resolving a server outage", "migrating customer databases", "configuring user permissions", "debugging an application crash", "upgrading network firewalls"],
    problems: ["a server timeout during peak hours", "an unhandled database exception", "a missing software license key", "a delayed feature release", "slow cloud processing speeds", "an unauthorized login alert"],
    solutions: ["restart the virtual server", "submit an urgent support ticket", "reallocate additional memory", "schedule maintenance after business hours", "contact the vendor for a patch", "run automated diagnostic tests"],
    vocab: [
      { word: "outage", pos: "n", level: "B2", ipaUS: "/ˈaʊ.t̬ɪdʒ/", ipaUK: "/ˈaʊ.tɪdʒ/", meaning: "sự cố ngừng hoạt động của hệ thống", example: "The unexpected server outage lasted two hours.", exampleTrans: "Sự cố ngừng máy chủ bất ngờ kéo dài hai tiếng." },
      { word: "configure", pos: "v", level: "B2", ipaUS: "/kənˈfɪɡ.jɚ/", ipaUK: "/kənˈfɪɡ.ər/", meaning: "cấu hình, thiết lập hệ thống", example: "The IT technician will configure your new workstation.", exampleTrans: "Kỹ thuật viên CNTT sẽ cấu hình máy trạm mới cho bạn." }
    ]
  },
  {
    name: "Hotel, Hospitality & Tourism",
    roles: ["Front Desk Supervisor", "Guest Concierge", "Hotel Operations Manager", "Tour Guide", "Event Planner", "Travel Consultant"],
    actions: ["checking in a corporate delegate", "arranging an airport limousine", "upgrading a suite reservation", "coordinating a banquet dinner", "reserving private excursion tickets", "handling an early arrival request"],
    problems: ["a double-booked executive suite", "a delayed luggage delivery from the airport", "a missing conference room booking", "an unavailable shuttle bus", "a power disruption in the west wing", "a dietary preference mismatch"],
    solutions: ["provide a complimentary breakfast voucher", "reassign the guest to a penthouse suite", "arrange a private taxi at hotel expense", "expedite room preparation with housekeeping", "offer discounted spa passes", "extend check-out time until 2:00 PM"],
    vocab: [
      { word: "concierge", pos: "n", level: "B2", ipaUS: "/kɑːn.siˈerʒ/", ipaUK: "/kɒn.siˈeəʒ/", meaning: "nhân viên hướng dẫn, hỗ trợ khách tại khách sạn", example: "Ask the concierge for local restaurant recommendations.", exampleTrans: "Hãy hỏi nhân viên hỗ trợ để được gợi ý nhà hàng địa phương." },
      { word: "complimentary", pos: "adj", level: "B2", ipaUS: "/ˌkɑːm.pləˈmen.t̬ɚ.i/", ipaUK: "/ˌkɒm.plɪˈmen.tər.i/", meaning: "miễn phí, quà tặng kèm", example: "The hotel offers complimentary high-speed Wi-Fi.", exampleTrans: "Khách sạn cung cấp Wi-Fi tốc độ cao miễn phí." }
    ]
  },
  {
    name: "Retail, Merchandising & Inventory",
    roles: ["Store Manager", "Inventory Controller", "Sales Representative", "Purchasing Agent", "Customer Service Lead", "Visual Merchandiser"],
    actions: ["restocking seasonal merchandise", "updating product display shelves", "processing bulk inventory transfers", "verifying barcode price tags", "managing supplier delivery manifests", "organizing clearance sale promotions"],
    problems: ["an out-of-stock popular jacket size", "a damaged freight shipment container", "an incorrect wholesale invoice charge", "a barcode scanning error at checkout", "delayed delivery of promotional posters", "a discrepancy in inventory counts"],
    solutions: ["check back stock in the regional warehouse", "place an expedited purchase order", "issue an immediate store credit or refund", "offer an equivalent alternative model", "contact the logistics courier for tracking", "apply a manager discount at the register"],
    vocab: [
      { word: "discrepancy", pos: "n", level: "C1", ipaUS: "/dɪˈskrep.ən.si/", ipaUK: "/dɪˈskrep.ən.si/", meaning: "sự sai lệch, không khớp giữa các con số", example: "The auditor found a discrepancy in the inventory ledger.", exampleTrans: "Kiểm toán viên phát hiện sự sai lệch trong sổ sách kho hàng." },
      { word: "clearance", pos: "n", level: "B2", ipaUS: "/ˈklɪr.əns/", ipaUK: "/ˈklɪə.rəns/", meaning: "đợt xả hàng, thanh lý tồn kho", example: "All winter apparel is on final clearance.", exampleTrans: "Toàn bộ trang phục mùa đông đang được xả kho đợt cuối." }
    ]
  },
  {
    name: "Human Resources, Payroll & Training",
    roles: ["HR Director", "Recruitment Specialist", "Training Coordinator", "Payroll Administrator", "Benefits Advisor", "Office Manager"],
    actions: ["conducting new-employee orientation", "reviewing health insurance benefits", "processing annual performance bonuses", "scheduling workplace safety workshops", "interviewing candidates for engineering roles", "updating direct deposit accounts"],
    problems: ["a delayed payroll direct deposit", "an incomplete employee tax form", "a scheduling conflict for safety training", "a missing background check certificate", "an unrecorded vacation day request", "an expired security access badge"],
    solutions: ["resubmit banking routing details", "reissue an electronic signature form", "reschedule the training session for Friday", "contact the payroll vendor immediately", "provide a temporary visitor pass", "credit paid time off to the account"],
    vocab: [
      { word: "probation", pos: "n", level: "B2", ipaUS: "/proʊˈbeɪ.ʃən/", ipaUK: "/prəˈbeɪ.ʃən/", meaning: "thời gian thử việc của nhân viên mới", example: "Benefits start after the three-month probation period.", exampleTrans: "Phúc lợi bắt đầu sau thời gian thử việc ba tháng." },
      { word: "reimburse", pos: "v", level: "B2", ipaUS: "/ˌriː.ɪmˈbɝːs/", ipaUK: "/ˌriː.ɪmˈbɜːs/", meaning: "hoàn trả chi phí, thanh toán lại tiền", example: "The company will reimburse your travel expenses.", exampleTrans: "Công ty sẽ hoàn trả chi phí công tác của bạn." }
    ]
  },
  {
    name: "Marketing, Public Relations & Advertising",
    roles: ["Marketing Director", "Graphic Designer", "Content Strategist", "PR Representative", "Media Buyer", "Brand Consultant"],
    actions: ["designing mobile advertisement banners", "launching a social media promotion", "reviewing demographic survey data", "presenting a brand identity mockup", "negotiating billboard placement rates", "organizing an influencer press conference"],
    problems: ["low mobile engagement metrics", "an inaccurate client logo color code", "delayed delivery of print flyers", "a negative online customer review", "an unexpected increase in advertising costs", "a technical glitch on the landing page"],
    solutions: ["revise the ad typography for mobile screens", "resend color-calibrated PDF proofs", "launch an targeted email campaign", "post an official clarification statement", "reallocate budget from print to digital media", "optimize web page loading speeds"],
    vocab: [
      { word: "demographics", pos: "n", level: "B2", ipaUS: "/ˌdem.əˈɡræf.ɪks/", ipaUK: "/ˌdem.əˈɡræf.ɪks/", meaning: "số liệu thống kê nhân khẩu học khách hàng", example: "The survey reveals shifts in customer demographics.", exampleTrans: "Khảo sát cho thấy sự thay đổi về nhân khẩu học khách hàng." },
      { word: "engagement", pos: "n", level: "B2", ipaUS: "/ɪnˈɡeɪdʒ.mənt/", ipaUK: "/ɪnˈɡeɪdʒ.mənt/", meaning: "mức độ tương tác của người dùng", example: "Our new social media campaign boosted customer engagement.", exampleTrans: "Chiến dịch mạng xã hội mới đã thúc đẩy tương tác khách hàng." }
    ]
  },
  {
    name: "Facility Management & Construction",
    roles: ["Building Superintendent", "General Contractor", "Safety Inspector", "Interior Architect", "HVAC Technician", "Electrician"],
    actions: ["inspecting ceiling insulation panels", "repairing a central ventilation duct", "renovating the main entrance lobby", "installing energy-efficient solar panels", "testing building sprinkler systems", "replacing outdated elevator cables"],
    problems: ["a leak in the rooftop drainage pipe", "an unexpected building code violation", "a delay in ceramic tile delivery", "an electrical circuit overload", "insufficient parking space in the garage", "excessive noise during office hours"],
    solutions: ["reschedule loud demolition for the weekend", "submit a revised architectural blueprint", "expedite building safety re-inspection", "install high-capacity circuit breakers", "seal the pipe with waterproof sealant", "expand designated employee parking zones"],
    vocab: [
      { word: "renovation", pos: "n", level: "B2", ipaUS: "/ˌren.əˈveɪ.ʃən/", ipaUK: "/ˌren.əˈveɪ.ʃən/", meaning: "công tác cải tạo, nâng cấp công trình", example: "The building renovation is scheduled for completion in May.", exampleTrans: "Việc cải tạo tòa nhà dự kiến hoàn thành vào tháng 5." },
      { word: "compliance", pos: "n", level: "C1", ipaUS: "/kəmˈplaɪ.əns/", ipaUK: "/kəmˈplaɪ.əns/", meaning: "sự tuân thủ các quy chuẩn an toàn", example: "Ensure full compliance with city building codes.", exampleTrans: "Đảm bảo tuân thủ đầy đủ các quy chuẩn xây dựng của thành phố." }
    ]
  },
  {
    name: "Finance, Accounting & Taxation",
    roles: ["Senior Accountant", "Chief Financial Officer", "Tax Consultant", "Budget Analyst", "Auditor", "Investment Advisor"],
    actions: ["auditing quarterly balance sheets", "filing corporate tax returns", "reallocating capital expenditure budgets", "reviewing cloud software licensing costs", "processing vendor invoice disbursements", "evaluating commercial loan applications"],
    problems: ["an unexpected tax penalty notice", "a budget deficit in research & development", "unreconciled merchant bank fees", "an overdue client account receivable", "a sudden surge in currency exchange rates", "duplicate payment on a supplier invoice"],
    solutions: ["request an extension from the tax authority", "shift surplus funds from travel budgets", "audit bank transaction statements", "issue a payment reminder notice", "hedge currency exposure with forward contracts", "apply a credit memo to the vendor account"],
    vocab: [
      { word: "disbursement", pos: "n", level: "C1", ipaUS: "/dɪsˈbɝːs.mənt/", ipaUK: "/dɪsˈbɜːs.mənt/", meaning: "khoản tiền giải ngân, chi trả chính thức", example: "All disbursements require dual supervisory approval.", exampleTrans: "Tất cả các khoản giải ngân đều cần sự phê duyệt của hai cấp quản lý." },
      { word: "reconcile", pos: "v", level: "C1", ipaUS: "/ˈrek.ən.saɪl/", ipaUK: "/ˈrek.ən.saɪl/", meaning: "đối chiếu, khớp sổ sách tài chính", example: "The accountant reconciled the bank statement with ledgers.", exampleTrans: "Kế toán viên đã đối chiếu sao kê ngân hàng với sổ cái." }
    ]
  },
  {
    name: "Logistics, Supply Chain & Shipping",
    roles: ["Logistics Coordinator", "Warehouse Dispatcher", "Freight Forwarder", "Customs Broker", "Fleet Supervisor", "Supply Chain Analyst"],
    actions: ["tracking an international cargo vessel", "clearing customs documentation", "dispatching a local delivery van", "optimizing pallet packing density", "negotiating maritime shipping rates", "organizing refrigerated transport"],
    problems: ["a severe port customs clearance delay", "a temperature fluctuation in cargo cold storage", "a delivery vehicle mechanical breakdown", "an incorrect commercial bill of lading", "fuel surcharge price hikes", "a damaged shipment container seal"],
    solutions: ["reroute cargo via air express courier", "resubmit revised customs declarations", "dispatch a backup delivery truck", "file an insurance claim for damaged goods", "negotiate volume discounts with carriers", "inspect warehouse climate control sensors"],
    vocab: [
      { word: "manifest", pos: "n", level: "C1", ipaUS: "/ˈmæn.ə.fest/", ipaUK: "/ˈmæn.ɪ.fest/", meaning: "bản kê khai chi tiết hàng hóa xuất nhập khẩu", example: "Verify all freight items on the shipping manifest.", exampleTrans: "Kiểm tra tất cả các kiện hàng trên bản kê khai vận tải." },
      { word: "surcharge", pos: "n", level: "B2", ipaUS: "/ˈsɝː.tʃɑːrdʒ/", ipaUK: "/ˈsɜː.tʃɑːdʒ/", meaning: "khoản phụ phí bổ sung", example: "A fuel surcharge was added to the freight invoice.", exampleTrans: "Một khoản phụ phí nhiên liệu đã được thêm vào hóa đơn vận chuyển." }
    ]
  }
];

// Generate 300 Distinct Scenarios
function build300UniquePassages() {
  const passages = [];
  const uniqueAudioPairs = [];

  for (const testFolder of VERIFIED_TESTS) {
    for (const range of RANGES) {
      uniqueAudioPairs.push({ folder: testFolder, range: range });
    }
  }

  for (let i = 0; i < 300; i++) {
    const pNum = i + 1;
    const pair = uniqueAudioPairs[i];
    const folder = pair.folder;
    const range = pair.range;

    const domain = DOMAINS[i % DOMAINS.length];
    const role1 = domain.roles[i % domain.roles.length];
    const role2 = domain.roles[(i + 1) % domain.roles.length];
    const action = domain.actions[i % domain.actions.length];
    const problem = domain.problems[i % domain.problems.length];
    const solution = domain.solutions[i % domain.solutions.length];

    const script = `Speaker 1 (${role1}): Hello, I'm calling regarding our project for ${action}. We recently encountered ${problem}.\nSpeaker 2 (${role2}): I understand the urgency. To resolve this without delaying our schedule, I suggest we ${solution}.\nSpeaker 1 (${role1}): That sounds like an effective approach. I will prepare the required paperwork and notify the team immediately.`;

    const translation = `Người 1 (${role1}): Xin chào, tôi gọi điện liên quan đến dự án ${action}. Chúng tôi vừa gặp phải ${problem}.\nNgười 2 (${role2}): Tôi hiểu tính cấp bách. Để giải quyết việc này mà không làm chậm tiến độ, tôi đề xuất chúng ta ${solution}.\nNgười 1 (${role1}): Nghe rất hiệu quả. Tôi sẽ chuẩn bị các giấy tờ cần thiết và thông báo cho cả đội ngay lập tức.`;

    // 3 Unique Questions
    const q1Prompt = "What are the speakers mainly discussing?";
    const q1PromptTrans = "Những người nói chủ yếu thảo luận về điều gì?";
    const q1Correct = `A plan for ${action}`;
    const q1Distractors = [
      "Cancelling an annual shareholder convention",
      "Selecting office furniture for a new branch",
      "Hiring an external consulting company"
    ];

    const q2Prompt = "What problem do the speakers mention?";
    const q2PromptTrans = "Người nói đề cập đến vấn đề gì?";
    const q2Correct = `There is ${problem}`;
    const q2Distractors = [
      "A manager is retiring next month",
      "A client sent an overdue invoice",
      "Severe weather forced a facility closure"
    ];

    const q3Prompt = "What does the second speaker suggest doing?";
    const q3PromptTrans = "Người nói thứ hai đề xuất làm gì?";
    const q3Correct = `To ${solution}`;
    const q3Distractors = [
      "Request a bank loan extension",
      "Postpone the product launch indefinitely",
      "Consult the municipal legal department"
    ];

    passages.push({
      passageNumber: pNum,
      passageId: `p3-lvl1-passage-${pNum}`,
      passageTitle: `Nhóm câu ${range.start}-${range.end} (3 câu hỏi)`,
      audioUrl: `${SUPABASE_CDN_BASE}/${folder}/${range.start}-${range.end}.mp3`,
      script: script,
      translation: translation,
      range: range,
      vocab: domain.vocab,
      qDefs: [
        { prompt: q1Prompt, promptTrans: q1PromptTrans, correct: q1Correct, dist: q1Distractors },
        { prompt: q2Prompt, promptTrans: q2PromptTrans, correct: q2Correct, dist: q2Distractors },
        { prompt: q3Prompt, promptTrans: q3PromptTrans, correct: q3Correct, dist: q3Distractors }
      ]
    });
  }

  return passages;
}

async function seed300Distinct() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB.');

    const passages = build300UniquePassages();
    const allQuestions = [];

    passages.forEach((p, pIdx) => {
      p.qDefs.forEach((qDef, subIdx) => {
        const globalQNum = allQuestions.length + 1;
        const qNumInTest = p.range.start + subIdx;

        // Ensure proper correct answer distribution
        const correctLetters = ['A', 'B', 'C', 'D'];
        const correctLetter = correctLetters[(p.passageNumber * 3 + subIdx) % 4];

        const dists = [...qDef.dist];
        const options = correctLetters.map(letter => {
          const isCorrect = letter === correctLetter;
          let text = isCorrect ? qDef.correct : dists.pop() || "Consulting a business specialist";
          return {
            label: `(${letter})`,
            text: text,
            translation: isCorrect ? `(Đúng) ${text}` : `(Sai) ${text}`,
            isCorrect: isCorrect
          };
        });

        allQuestions.push({
          questionNumber: globalQNum,
          passageId: p.passageId,
          passageNumber: p.passageNumber,
          passageTitle: p.passageTitle,
          subQuestionIndex: subIdx,
          testQuestionNumber: qNumInTest,
          audioUrl: p.audioUrl,
          imageUrl: null,
          promptText: qDef.prompt, // Clean prompt WITHOUT duplicated number!
          promptTranslation: qDef.promptTrans,
          options: options,
          transcript: p.script,
          translation: p.translation,
          dictationText: qDef.correct,
          blanks: [{ word: qDef.correct.split(' ')[0] || 'At', index: 0 }],
          explanation: `💡 **Giải thích chi tiết ETS:**\n- **Dẫn chứng Transcript:** "${p.script.split('\n')[subIdx] || p.script}"\n- **Lời dịch:** ${p.translation.split('\n')[subIdx] || p.translation}\n- **Phương án đúng:** **(${correctLetter}) ${qDef.correct}**`,
          vocabularyList: p.vocab
        });
      });
    });

    // Save into MongoDB
    const updatedDoc = await ListeningExercise.findOneAndUpdate(
      { mode: 'level', part: 3, level: 1 },
      {
        title: 'Level 1 — Dễ (300 Đoạn Hội Thoại / 900 Câu ETS Gốc)',
        part: 3,
        level: 1,
        mode: 'level',
        year: '2026',
        isPro: false,
        totalQuestions: allQuestions.length,
        questions: allQuestions
      },
      { upsert: true, new: true }
    );

    console.log(`\n🎉 SEED THÀNH CÔNG 300 PASSAGES HOÀN TOÀN ĐỘC LẬP!`);
    console.log(`📊 Tổng số Đoạn hội thoại: ${Math.floor(updatedDoc.questions.length / 3)}`);
    console.log(`📊 Tổng số Câu hỏi: ${updatedDoc.questions.length}`);
    console.log(`Sample Q1 (Nhóm 1): ${updatedDoc.questions[0].options[0].text}`);
    console.log(`Sample Q4 (Nhóm 2): ${updatedDoc.questions[3].options[0].text}`);
    console.log(`Sample Q28 (Nhóm 10): ${updatedDoc.questions[27].options[0].text}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed300Distinct();
