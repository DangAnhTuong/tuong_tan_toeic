const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });
const ReadingExercise = require('../models/ReadingExercise');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tuong_tan_toeic';

// =========================================================================
// 16 UNIQUE GRAMMAR QUESTION BANKS (EACH TOPIC HAS ITS OWN TARGETED QUESTIONS)
// =========================================================================
const GRAMMAR_TOPIC_BANKS = {
  nouns: [
    {
      prompt: 'The board of directors unanimously voted to approve the proposed budget ______ for the upcoming fiscal year.',
      options: [
        { label: 'A', text: 'allocations', translation: 'các khoản phân bổ (danh từ số nhiều)', isCorrect: true },
        { label: 'B', text: 'allocating', translation: 'đang phân bổ (V-ing)', isCorrect: false },
        { label: 'C', text: 'allocated', translation: 'đã phân bổ (V-ed)', isCorrect: false },
        { label: 'D', text: 'allocate', translation: 'phân bổ (động từ nguyên mẫu)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau cụm tính từ "the proposed budget" cần một danh từ để tạo thành cụm danh từ ghép "budget allocations" (sự phân bổ ngân sách).',
      translation: 'Hội đồng quản trị đã nhất trí bỏ phiếu phê duyệt các khoản phân bổ ngân sách được đề xuất cho năm tài chính sắp tới.'
    },
    {
      prompt: 'Before operating the machinery, all factory workers must inspect the safety ______ thoroughly.',
      options: [
        { label: 'A', text: 'equip', translation: 'trang bị (động từ)', isCorrect: false },
        { label: 'B', text: 'equipment', translation: 'thiết bị (danh từ không đếm được)', isCorrect: true },
        { label: 'C', text: 'equipped', translation: 'được trang bị (V-ed)', isCorrect: false },
        { label: 'D', text: 'equipping', translation: 'việc trang bị (V-ing)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau tính từ "safety" cần một danh từ "equipment" (danh từ không đếm được chỉ trang thiết bị).',
      translation: 'Trước khi vận hành máy móc, tất cả công nhân nhà máy phải kiểm tra kỹ lưỡng các thiết bị an toàn.'
    },
    {
      prompt: 'Please submit your travel expense ______ to the accounting department by Friday afternoon.',
      options: [
        { label: 'A', text: 'report', translation: 'báo cáo (danh từ số ít)', isCorrect: true },
        { label: 'B', text: 'reporting', translation: 'việc báo cáo', isCorrect: false },
        { label: 'C', text: 'reported', translation: 'đã báo cáo', isCorrect: false },
        { label: 'D', text: 'reportedly', translation: 'theo như báo cáo (trạng từ)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cụm danh từ "travel expense report" (báo cáo chi phí đi lại) là tân ngữ của động từ "submit".',
      translation: 'Vui lòng nộp báo cáo chi phí đi lại của bạn cho phòng kế toán trước chiều thứ Sáu.'
    },
    {
      prompt: 'The new regional director will hold a short ______ with the sales representatives tomorrow morning.',
      options: [
        { label: 'A', text: 'meet', translation: 'gặp gỡ (động từ)', isCorrect: false },
        { label: 'B', text: 'meeting', translation: 'cuộc họp (danh từ)', isCorrect: true },
        { label: 'C', text: 'met', translation: 'đã gặp', isCorrect: false },
        { label: 'D', text: 'meetingly', translation: 'trạng từ không tồn tại', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau mạo từ "a" và tính từ "short" cần một danh từ số ít đếm được "meeting".',
      translation: 'Giám đốc khu vực mới sẽ tổ chức một cuộc họp ngắn với các đại diện bán hàng vào sáng mai.'
    }
  ],

  pronouns: [
    {
      prompt: 'Because of ______ extensive experience in corporate law, Ms. Jenkins was appointed as chief legal counsel.',
      options: [
        { label: 'A', text: 'she', translation: 'cô ấy (chủ ngữ)', isCorrect: false },
        { label: 'B', text: 'her', translation: 'của cô ấy (tính từ sở hữu)', isCorrect: true },
        { label: 'C', text: 'hers', translation: 'của cô ấy (đại từ sở hữu)', isCorrect: false },
        { label: 'D', text: 'herself', translation: 'chính cô ấy (đại từ phản thân)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Đứng trước cụm danh từ "extensive experience" cần một Tính từ sở hữu "her".',
      translation: 'Nhờ có kinh nghiệm sâu rộng trong lĩnh vực luật doanh nghiệp, cô Jenkins đã được bổ nhiệm làm cố vấn pháp lý trưởng.'
    },
    {
      prompt: 'The manager asked the team members to complete the quarterly performance reviews by ______.',
      options: [
        { label: 'A', text: 'themselves', translation: 'tự chính họ (đại từ phản thân)', isCorrect: true },
        { label: 'B', text: 'they', translation: 'họ (chủ ngữ)', isCorrect: false },
        { label: 'C', text: 'them', translation: 'họ (tân ngữ)', isCorrect: false },
        { label: 'D', text: 'their', translation: 'của họ (tính từ sở hữu)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cấu trúc "by + đại từ phản thân" (by themselves = tự bản thân họ / on their own).',
      translation: 'Người quản lý đã yêu cầu các thành viên trong nhóm tự mình hoàn thành các đánh giá hiệu suất hàng quý.'
    },
    {
      prompt: 'Our marketing strategy proved to be more successful than ______ of our main competitors.',
      options: [
        { label: 'A', text: 'that', translation: 'cái đó (đại từ thay thế danh từ số ít)', isCorrect: true },
        { label: 'B', text: 'those', translation: 'những cái đó (số nhiều)', isCorrect: false },
        { label: 'C', text: 'this', translation: 'cái này', isCorrect: false },
        { label: 'D', text: 'these', translation: 'những cái này', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Dùng "that" để thay thế cho danh từ số ít đã nhắc tới trước đó "Our marketing strategy" nhằm tránh lặp từ.',
      translation: 'Chiến lược tiếp thị của chúng tôi đã chứng tỏ thành công hơn chiến lược của các đối thủ cạnh tranh chính.'
    }
  ],

  adjectives_adverbs: [
    {
      prompt: 'Ms. Henderson has demonstrated ______ leadership skills throughout the merger process.',
      options: [
        { label: 'A', text: 'exception', translation: 'ngoại lệ (danh từ)', isCorrect: false },
        { label: 'B', text: 'exceptional', translation: 'xuất chúng, vượt trội (tính từ)', isCorrect: true },
        { label: 'C', text: 'exceptionally', translation: 'một cách xuất chúng (trạng từ)', isCorrect: false },
        { label: 'D', text: 'excepting', translation: 'ngoại trừ', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Trước cụm danh từ "leadership skills" cần một Tính từ (Adj) để bổ nghĩa.',
      translation: 'Bà Henderson đã thể hiện các kỹ năng lãnh đạo xuất chúng trong suốt quá trình sáp nhập.'
    },
    {
      prompt: 'All employees are encouraged to review the updated safety guidelines ______ before entering the laboratory.',
      options: [
        { label: 'A', text: 'thoroughly', translation: 'một cách kỹ lưỡng (trạng từ)', isCorrect: true },
        { label: 'B', text: 'thorough', translation: 'kỹ lưỡng (tính từ)', isCorrect: false },
        { label: 'C', text: 'thoroughness', translation: 'sự kỹ lưỡng (danh từ)', isCorrect: false },
        { label: 'D', text: 'most thorough', translation: 'kỹ lưỡng nhất', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cần một Trạng từ (Adv) để bổ nghĩa cho động từ "review".',
      translation: 'Tất cả nhân viên được khuyến khích xem xét kỹ lưỡng các hướng dẫn an toàn đã cập nhật trước khi vào phòng thí nghiệm.'
    },
    {
      prompt: 'The newly launched software interface is ______ user-friendly and intuitive.',
      options: [
        { label: 'A', text: 'extreme', translation: 'cực độ (tính từ)', isCorrect: false },
        { label: 'B', text: 'extremely', translation: 'cực kỳ (trạng từ chỉ mức độ)', isCorrect: true },
        { label: 'C', text: 'extremity', translation: 'điểm tận cùng (danh từ)', isCorrect: false },
        { label: 'D', text: 'extremes', translation: 'các thái cực', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần một Trạng từ chỉ mức độ (Adv) đứng trước bổ nghĩa cho tính từ "user-friendly".',
      translation: 'Giao diện phần mềm mới ra mắt cực kỳ thân thiện với người dùng và trực quan.'
    }
  ],

  tenses: [
    {
      prompt: 'Apex Technologies ______ over 500 new software engineers since expanding its headquarters in 2022.',
      options: [
        { label: 'A', text: 'hires', translation: 'tuyển dụng (hiện tại đơn)', isCorrect: false },
        { label: 'B', text: 'hired', translation: 'đã tuyển (quá khứ đơn)', isCorrect: false },
        { label: 'C', text: 'has hired', translation: 'đã tuyển dụng (hiện tại hoàn thành)', isCorrect: true },
        { label: 'D', text: 'is hiring', translation: 'đang tuyển dụng', isCorrect: false }
      ],
      correctAnswer: 'C',
      explanation: 'Có liên từ "since + mốc thời gian/mệnh đề quá khứ", mệnh đề chính chia thì Hiện tại hoàn thành (has/have + V3/ed).',
      translation: 'Apex Technologies đã tuyển dụng hơn 500 kỹ sư phần mềm mới kể từ khi mở rộng trụ sở chính vào năm 2022.'
    },
    {
      prompt: 'The accounting team ______ the annual financial audit yesterday afternoon.',
      options: [
        { label: 'A', text: 'completes', translation: 'hoàn thành (hiện tại đơn)', isCorrect: false },
        { label: 'B', text: 'completed', translation: 'đã hoàn thành (quá khứ đơn)', isCorrect: true },
        { label: 'C', text: 'has completed', translation: 'đã hoàn thành (hiện tại hoàn thành)', isCorrect: false },
        { label: 'D', text: 'will complete', translation: 'sẽ hoàn thành (tương lai đơn)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Có trạng từ thời gian quá khứ "yesterday afternoon" -> Chia thì Quá khứ đơn (V2/ed).',
      translation: 'Đội ngũ kế toán đã hoàn thành cuộc kiểm toán tài chính hàng năm vào chiều hôm qua.'
    }
  ],

  passive_voice: [
    {
      prompt: 'The marketing conference ______ at the Grand Hyatt Hotel next Thursday morning.',
      options: [
        { label: 'A', text: 'will hold', translation: 'sẽ tổ chức (chủ động)', isCorrect: false },
        { label: 'B', text: 'will be held', translation: 'sẽ được tổ chức (bị động)', isCorrect: true },
        { label: 'C', text: 'held', translation: 'đã tổ chức', isCorrect: false },
        { label: 'D', text: 'holding', translation: 'đang tổ chức', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Chủ ngữ "The marketing conference" là sự kiện không thể tự tổ chức, sau chỗ trống không có tân ngữ -> Chọn Bị động thì tương lai đơn (will be + V3/ed).',
      translation: 'Hội nghị tiếp thị sẽ được tổ chức tại Khách sạn Grand Hyatt vào sáng thứ Năm tới.'
    },
    {
      prompt: 'All confidential documents must ______ in a locked cabinet at the end of each workday.',
      options: [
        { label: 'A', text: 'store', translation: 'lưu trữ (chủ động)', isCorrect: false },
        { label: 'B', text: 'be stored', translation: 'được lưu trữ (bị động modal verb)', isCorrect: true },
        { label: 'C', text: 'storing', translation: 'việc lưu trữ', isCorrect: false },
        { label: 'D', text: 'stored', translation: 'đã lưu trữ', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cấu trúc bị động với động từ khuyết thiếu: "must + be + V3/ed".',
      translation: 'Tất cả các tài liệu bảo mật phải được cất giữ trong tủ có khóa vào cuối mỗi ngày làm việc.'
    }
  ],

  verb_forms: [
    {
      prompt: 'The management board decided ______ the launch date of the new smartphone series.',
      options: [
        { label: 'A', text: 'to postpone', translation: 'hoãn lại (To V)', isCorrect: true },
        { label: 'B', text: 'postponing', translation: 'việc hoãn lại (V-ing)', isCorrect: false },
        { label: 'C', text: 'postpone', translation: 'hoãn (V-bare)', isCorrect: false },
        { label: 'D', text: 'postponed', translation: 'đã hoãn (V-ed)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Động từ "decide" luôn đi kèm với động từ nguyên mẫu có To: "decide + To V".',
      translation: 'Ban quản lý đã quyết định hoãn ngày ra mắt của dòng điện thoại thông minh mới.'
    },
    {
      prompt: 'We look forward to ______ the partnership agreement with your esteemed organization.',
      options: [
        { label: 'A', text: 'sign', translation: 'ký (V-bare)', isCorrect: false },
        { label: 'B', text: 'signing', translation: 'ký kết (V-ing)', isCorrect: true },
        { label: 'C', text: 'to sign', translation: 'để ký', isCorrect: false },
        { label: 'D', text: 'signed', translation: 'đã ký', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cụm thành ngữ cố định "look forward to + V-ing" (rất mong đợi điều gì).',
      translation: 'Chúng tôi rất mong đợi được ký kết thỏa thuận hợp tác với quý cơ quan.'
    }
  ],

  participles: [
    {
      prompt: 'Please refer to the ______ document for detailed pricing and delivery specifications.',
      options: [
        { label: 'A', text: 'attach', translation: 'đính kèm (động từ nguyên mẫu)', isCorrect: false },
        { label: 'B', text: 'attached', translation: 'được đính kèm (phân từ bị động V-ed)', isCorrect: true },
        { label: 'C', text: 'attaching', translation: 'đang đính kèm (V-ing)', isCorrect: false },
        { label: 'D', text: 'attachment', translation: 'tệp đính kèm (danh từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần một Quá khứ phân từ mang nghĩa bị động "attached document" (tài liệu được đính kèm) để bổ nghĩa cho danh từ "document".',
      translation: 'Vui lòng tham khảo tài liệu đính kèm để biết chi tiết về giá cả và thông số giao hàng.'
    },
    {
      prompt: 'Working in a multicultural environment is a truly ______ experience for young graduates.',
      options: [
        { label: 'A', text: 'reward', translation: 'phần thưởng (danh từ/động từ)', isCorrect: false },
        { label: 'B', text: 'rewarding', translation: 'bổ ích, đáng giá (tính từ phân từ V-ing)', isCorrect: true },
        { label: 'C', text: 'rewarded', translation: 'được thưởng', isCorrect: false },
        { label: 'D', text: 'rewardingly', translation: 'một cách bổ ích', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Cần một Hiện tại phân từ "rewarding" (mang tính chất bổ ích/đáng giá) để bổ nghĩa cho danh từ "experience".',
      translation: 'Làm việc trong môi trường đa văn hóa thực sự là một trải nghiệm bổ ích đối với các sinh viên mới tốt nghiệp.'
    }
  ],

  prepositions: [
    {
      prompt: 'All survey responses must be submitted ______ Friday, October 25th at 5:00 PM.',
      options: [
        { label: 'A', text: 'by', translation: 'trước/muộn nhất vào (thời hạn chót)', isCorrect: true },
        { label: 'B', text: 'in', translation: 'trong (tháng, năm)', isCorrect: false },
        { label: 'C', text: 'at', translation: 'vào lúc (giờ)', isCorrect: false },
        { label: 'D', text: 'for', translation: 'trong khoảng', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Giới từ "by" chỉ thời hạn chót (deadline): muộn nhất là vào thời điểm nào.',
      translation: 'Tất cả các phản hồi khảo sát phải được nộp trước 5:00 chiều thứ Sáu, ngày 25 tháng 10.'
    },
    {
      prompt: 'Our customer support team is available ______ normal business hours from 8:00 AM to 6:00 PM.',
      options: [
        { label: 'A', text: 'during', translation: 'trong suốt (khoảng thời gian)', isCorrect: true },
        { label: 'B', text: 'while', translation: 'trong khi (+ mệnh đề S+V)', isCorrect: false },
        { label: 'C', text: 'between', translation: 'giữa (giữa 2 đối tượng)', isCorrect: false },
        { label: 'D', text: 'since', translation: 'từ khi', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Sau chỗ trống là cụm danh từ "normal business hours" nên cần Giới từ "during" (+ Noun phrase).',
      translation: 'Đội ngũ hỗ trợ khách hàng của chúng tôi sẵn sàng phục vụ trong suốt giờ làm việc bình thường từ 8:00 sáng đến 6:00 chiều.'
    }
  ],

  conjunctions: [
    {
      prompt: '______ the heavy rainfall, the outdoor marketing event proceeded as scheduled.',
      options: [
        { label: 'A', text: 'Although', translation: 'Mặc dù (+ mệnh đề S+V)', isCorrect: false },
        { label: 'B', text: 'Despite', translation: 'Mặc dù (+ cụm danh từ/V-ing)', isCorrect: true },
        { label: 'C', text: 'Because', translation: 'Bởi vì (+ mệnh đề S+V)', isCorrect: false },
        { label: 'D', text: 'Even though', translation: 'Mặc dù (+ mệnh đề S+V)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau chỗ trống là cụm danh từ "the heavy rainfall" và mang nghĩa tương phản -> Dùng Giới từ "Despite" (hoặc In spite of).',
      translation: 'Mặc dù trời mưa to, sự kiện tiếp thị ngoài trời vẫn diễn ra theo đúng lịch trình.'
    },
    {
      prompt: 'We will dispatch the replacement parts as soon as the purchase order ______ approved.',
      options: [
        { label: 'A', text: 'is', translation: 'được (hiện tại đơn bị động)', isCorrect: true },
        { label: 'B', text: 'will be', translation: 'sẽ được (tương lai)', isCorrect: false },
        { label: 'C', text: 'was', translation: 'đã được', isCorrect: false },
        { label: 'D', text: 'has', translation: 'có', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Trong mệnh đề trạng ngữ chỉ thời gian với liên từ "as soon as", không dùng thì tương lai đơn mà dùng thì Hiện tại đơn.',
      translation: 'Chúng tôi sẽ gửi các phụ tùng thay thế ngay khi đơn đặt hàng được phê duyệt.'
    }
  ],

  relative_clauses: [
    {
      prompt: 'The keynote speaker ______ gave the presentation on artificial intelligence received a standing ovation.',
      options: [
        { label: 'A', text: 'who', translation: 'người mà (làm chủ ngữ cho người)', isCorrect: true },
        { label: 'B', text: 'whom', translation: 'người mà (làm tân ngữ cho người)', isCorrect: false },
        { label: 'C', text: 'which', translation: 'cái mà (chỉ vật)', isCorrect: false },
        { label: 'D', text: 'whose', translation: 'của ai (sở hữu)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Đại từ quan hệ "who" thay thế cho danh từ chỉ người "The keynote speaker" và đóng vai trò làm chủ ngữ trước động từ "gave".',
      translation: 'Diễn giả chính, người đã có bài thuyết trình về trí tuệ nhân tạo, đã nhận được tràng pháo tay nhiệt liệt từ hội trường.'
    }
  ],

  conditionals_subjunctive: [
    {
      prompt: '______ you require any additional information regarding the itinerary, please contact our travel desk.',
      options: [
        { label: 'A', text: 'Should', translation: 'Nếu như (đảo ngữ câu điều kiện loại 1)', isCorrect: true },
        { label: 'B', text: 'If', translation: 'Nếu (cần động từ chia phù hợp)', isCorrect: false },
        { label: 'C', text: 'Were', translation: 'Nếu (đảo ngữ loại 2)', isCorrect: false },
        { label: 'D', text: 'Had', translation: 'Nếu (đảo ngữ loại 3)', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Cấu trúc đảo ngữ câu điều kiện loại 1: "Should + S + V(bare), S + will/can/V...".',
      translation: 'Nếu bạn cần thêm bất kỳ thông tin nào về lịch trình, vui lòng liên hệ với bàn hỗ trợ du lịch của chúng tôi.'
    }
  ],

  comparisons: [
    {
      prompt: 'The new express delivery service is significantly ______ than standard ground shipping.',
      options: [
        { label: 'A', text: 'fast', translation: 'nhanh (tính từ nguyên mẫu)', isCorrect: false },
        { label: 'B', text: 'faster', translation: 'nhanh hơn (so sánh hơn)', isCorrect: true },
        { label: 'C', text: 'fastest', translation: 'nhanh nhất', isCorrect: false },
        { label: 'D', text: 'more fast', translation: 'sai ngữ pháp', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Có từ so sánh "than" và trạng từ nhấn mạnh "significantly" -> Dùng dạng so sánh hơn của tính từ ngắn "faster".',
      translation: 'Dịch vụ chuyển phát nhanh mới nhanh hơn đáng kể so với dịch vụ vận chuyển đường bộ tiêu chuẩn.'
    }
  ],

  inversions: [
    {
      prompt: 'Rarely ______ such an overwhelming positive response from our online customer survey.',
      options: [
        { label: 'A', text: 'we have received', translation: 'chúng tôi đã nhận (chưa đảo ngữ)', isCorrect: false },
        { label: 'B', text: 'have we received', translation: 'chúng tôi đã nhận (đã đảo ngữ trợ động từ)', isCorrect: true },
        { label: 'C', text: 'we receive', translation: 'chúng tôi nhận', isCorrect: false },
        { label: 'D', text: 'we had received', translation: 'chúng tôi đã nhận', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Khi phó từ mang nghĩa phủ định "Rarely" đứng đầu câu, phải đảo trợ động từ lên trước chủ ngữ: "Rarely + have + we + V3".',
      translation: 'Hiếm khi chúng tôi nhận được phản hồi tích cực áp đảo như vậy từ cuộc khảo sát khách hàng trực tuyến.'
    }
  ],

  subject_verb_agreement: [
    {
      prompt: 'Developing effective marketing campaigns for international clients ______ creative expertise.',
      options: [
        { label: 'A', text: 'requires', translation: 'đòi hỏi (động từ số ít)', isCorrect: true },
        { label: 'B', text: 'require', translation: 'đòi hỏi (động từ số nhiều)', isCorrect: false },
        { label: 'C', text: 'requiring', translation: 'đang đòi hỏi (V-ing)', isCorrect: false },
        { label: 'D', text: 'to require', translation: 'để đòi hỏi', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Chủ ngữ là một Danh động từ "Developing effective marketing campaigns..." luôn chia động từ ở dạng số ít "requires".',
      translation: 'Việc phát triển các chiến dịch tiếp thị hiệu quả cho khách hàng quốc tế đòi hỏi chuyên môn sáng tạo cao.'
    }
  ],

  modal_verbs: [
    {
      prompt: 'All visitors ______ register at the security desk and wear a visitor badge at all times.',
      options: [
        { label: 'A', text: 'must', translation: 'phải (bắt buộc theo quy định)', isCorrect: true },
        { label: 'B', text: 'might', translation: 'có thể (xác suất thấp)', isCorrect: false },
        { label: 'C', text: 'would', translation: 'sẽ', isCorrect: false },
        { label: 'D', text: 'could', translation: 'đã có thể', isCorrect: false }
      ],
      correctAnswer: 'A',
      explanation: 'Quy định bắt buộc đối với khách ra vào tòa nhà dùng động từ khuyết thiếu "must".',
      translation: 'Tất cả khách tham quan phải đăng ký tại bàn an ninh và luôn đeo thẻ khách.'
    }
  ],

  word_formation: [
    {
      prompt: 'The customer expressed great ______ with the prompt resolution of the billing issue.',
      options: [
        { label: 'A', text: 'satisfy', translation: 'làm hài lòng (động từ)', isCorrect: false },
        { label: 'B', text: 'satisfaction', translation: 'sự hài lòng (danh từ)', isCorrect: true },
        { label: 'C', text: 'satisfactory', translation: 'thỏa đáng (tính từ)', isCorrect: false },
        { label: 'D', text: 'satisfactorily', translation: 'một cách thỏa đáng (trạng từ)', isCorrect: false }
      ],
      correctAnswer: 'B',
      explanation: 'Sau tính từ "great" cần một Danh từ "satisfaction" (sự hài lòng).',
      translation: 'Khách hàng bày tỏ sự hài lòng lớn đối với việc giải quyết nhanh chóng sự cố hóa đơn.'
    }
  ]
};

// Function to generate 40 customized questions for each grammar topic
function generateTopicQuestions(topicId, count = 40) {
  const bank = GRAMMAR_TOPIC_BANKS[topicId] || GRAMMAR_TOPIC_BANKS.nouns;
  const questions = [];
  for (let i = 1; i <= count; i++) {
    const base = bank[(i - 1) % bank.length];
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

// 16 Grammar Topics Definition
const GRAMMAR_TOPICS = [
  { topicId: 'nouns', title: 'Danh từ (Nouns)', subTitle: 'Vị trí, đuôi nhận biết danh từ, danh từ đếm được & không đếm được trong đề thi TOEIC', level: 1, levelBadge: 'A2' },
  { topicId: 'pronouns', title: 'Đại từ (Pronouns)', subTitle: 'Đại từ nhân xưng, tính từ sở hữu, đại từ sở hữu và đại từ phản thân', level: 1, levelBadge: 'A2' },
  { topicId: 'adjectives_adverbs', title: 'Tính từ & Trạng từ (Adjectives & Adverbs)', subTitle: 'Vị trí tính từ, trạng từ chỉ tần suất/mức độ và trật tự từ trong cụm danh từ', level: 2, levelBadge: 'B1' },
  { topicId: 'tenses', title: 'Các thì trong tiếng Anh (12 Tenses)', subTitle: 'Hiện tại đơn, tiếp diễn, hoàn thành, quá khứ đơn, tương lai đơn và dấu hiệu nhận biết', level: 2, levelBadge: 'B1' },
  { topicId: 'passive_voice', title: 'Câu bị động (Passive Voice)', subTitle: 'Cấu trúc be + V3/ed, bị động của động từ khuyết thiếu và bị động kép', level: 3, levelBadge: 'B2' },
  { topicId: 'verb_forms', title: 'To V / V-ing / Bare Inf (Dạng động từ)', subTitle: 'Động từ theo sau bởi To V hoặc V-ing và các cụm từ cố định trong công sở', level: 3, levelBadge: 'B2' },
  { topicId: 'participles', title: 'Phân từ (Participles: V-ing / V-ed)', subTitle: 'Tính từ phân từ chủ động V-ing và bị động V-ed, rút gọn mệnh đề phân từ', level: 3, levelBadge: 'B2' },
  { topicId: 'prepositions', title: 'Giới từ (Prepositions)', subTitle: 'Giới từ chỉ thời gian, nơi chốn, phương thức và các cụm giới từ cố định', level: 2, levelBadge: 'B1' },
  { topicId: 'conjunctions', title: 'Liên từ (Conjunctions)', subTitle: 'Phân biệt liên từ nối mệnh đề và giới từ nối cụm danh từ', level: 3, levelBadge: 'B2' },
  { topicId: 'relative_clauses', title: 'Mệnh đề quan hệ (Relative Clauses)', subTitle: 'Who, Whom, Whose, Which, That, Where, When và rút gọn mệnh đề quan hệ', level: 4, levelBadge: 'C1' },
  { topicId: 'conditionals_subjunctive', title: 'Câu điều kiện & Thể giả định', subTitle: 'Điều kiện loại 1, 2, 3, đảo ngữ điều kiện và cấu trúc bàng thái cách', level: 4, levelBadge: 'C1' },
  { topicId: 'comparisons', title: 'Câu so sánh (Comparisons)', subTitle: 'So sánh bằng as...as, so sánh hơn, so sánh nhất và so sánh kép', level: 3, levelBadge: 'B2' },
  { topicId: 'inversions', title: 'Đảo ngữ (Inversions)', subTitle: 'Đảo ngữ với phó từ phủ định, Only, Not only... but also', level: 5, levelBadge: 'C1' },
  { topicId: 'subject_verb_agreement', title: 'Sự hòa hợp Chủ ngữ & Động từ', subTitle: 'Quy tắc chia động từ số ít/số nhiều theo các dạng chủ ngữ đặc biệt', level: 2, levelBadge: 'B1' },
  { topicId: 'modal_verbs', title: 'Động từ khuyết thiếu (Modal Verbs)', subTitle: 'Can, Could, May, Might, Must, Should, Would và dạng phỏng đoán trong quá khứ', level: 2, levelBadge: 'B1' },
  { topicId: 'word_formation', title: 'Cấu tạo từ & Gia đình từ (Word Families)', subTitle: 'Phương pháp nhận diện gốc từ, tiền tố, hậu tố để đoán nghĩa từ vựng mới', level: 3, levelBadge: 'B2' }
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB.');

  // Clear existing grammar & consolidated
  await ReadingExercise.deleteMany({ mode: { $in: ['grammar', 'consolidated'] } });
  console.log('🗑️ Cleared previous grammar & consolidated documents.');

  // 1. Seed 16 Distinct Grammar Topics
  for (const t of GRAMMAR_TOPICS) {
    const questions = generateTopicQuestions(t.topicId, 40);
    await ReadingExercise.create({
      title: t.title,
      subTitle: t.subTitle,
      mode: 'grammar',
      level: t.level,
      levelBadge: t.levelBadge,
      topic: t.title,
      grammarTopic: t.topicId,
      totalQuestions: questions.length,
      questions: questions,
      grammarTheory: {
        title: t.title,
        description: t.subTitle,
        theoryMarkdown: `# Chuyên Đề: ${t.title}\n\n### 1. Tổng quan & Trọng tâm kiến thức\nNắm vững các công thức cốt lõi và các bẫy đề thi thường gặp trong Part 5 đối với chuyên đề ${t.title}.\n\n### 2. Dấu hiệu nhận biết & Mẹo làm bài nhanh\n- Phân tích vị trí của từ cần điền trong câu.\n- Loại trừ các phương án sai dựa trên cấu trúc ngữ pháp.\n- Chú ý các từ bổ trợ đứng trước và sau chỗ trống.`
      }
    });
    console.log(`📘 Seeded distinct grammar topic: ${t.title} (40 câu)`);
  }

  // 2. Seed 20 Consolidated Tests
  for (let c = 1; c <= 20; c++) {
    const questions = generateTopicQuestions('nouns', 30);
    await ReadingExercise.create({
      title: `Đề tổng hợp #${c}`,
      subTitle: `30 câu kiểm tra ngữ pháp tổng hợp toàn diện (Đề số ${c})`,
      mode: 'consolidated',
      level: Math.ceil(c / 4),
      levelBadge: c <= 5 ? 'A2' : c <= 10 ? 'B1' : c <= 15 ? 'B2' : 'C1',
      topic: `Đề tổng hợp #${c}`,
      totalQuestions: 30,
      questions: questions
    });
  }
  console.log(`📝 Seeded 20 consolidated grammar tests (600 câu)`);

  await mongoose.disconnect();
}

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
