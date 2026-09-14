// Comprehensive TOEIC English-to-Vietnamese Translation Dictionary for Reading Options
const READING_OPTION_DICT = {
  // Pronouns
  'she': 'cô ấy (đại từ chủ ngữ)',
  'he': 'anh ấy (đại từ chủ ngữ)',
  'they': 'họ, chúng (đại từ chủ ngữ)',
  'we': 'chúng tôi, chúng ta (đại từ chủ ngữ)',
  'i': 'tôi (đại từ chủ ngữ)',
  'you': 'bạn, các bạn',
  'it': 'nó (chủ ngữ / tân ngữ)',
  'her': 'của cô ấy (tính từ sở hữu) / cô ấy (tân ngữ)',
  'him': 'anh ấy (đại từ tân ngữ)',
  'them': 'họ, chúng nó (đại từ tân ngữ)',
  'us': 'chúng tôi, chúng ta (đại từ tân ngữ)',
  'me': 'tôi (đại từ tân ngữ)',
  'his': 'của anh ấy (tính từ / đại từ sở hữu)',
  'their': 'của họ (tính từ sở hữu)',
  'theirs': 'cái của họ (đại từ sở hữu)',
  'our': 'của chúng tôi (tính từ sở hữu)',
  'ours': 'cái của chúng tôi (đại từ sở hữu)',
  'hers': 'cái của cô ấy (đại từ sở hữu)',
  'mine': 'cái của tôi (đại từ sở hữu)',
  'yours': 'cái của bạn (đại từ sở hữu)',
  'its': 'của nó (tính từ sở hữu)',
  'herself': 'chính cô ấy (đại từ phản thân)',
  'himself': 'chính anh ấy (đại từ phản thân)',
  'themselves': 'chính họ (đại từ phản thân)',
  'ourselves': 'chính chúng tôi (đại từ phản thân)',
  'myself': 'chính tôi (đại từ phản thân)',
  'yourself': 'chính bạn (đại từ phản thân)',
  'yourselves': 'chính các bạn (đại từ phản thân)',
  'itself': 'chính nó (đại từ phản thân)',
  'one': 'một người, một cái',
  'ones': 'những cái, những người',
  'another': 'một cái khác, một người khác',
  'other': 'khác (đứng trước danh từ)',
  'others': 'những người khác, những cái khác',
  'each other': 'lẫn nhau (2 người/vật)',
  'one another': 'lẫn nhau (3 người/vật trở lên)',
  'anyone': 'bất kỳ ai',
  'someone': 'ai đó, một người nào đó',
  'everyone': 'mọi người',
  'no one': 'không một ai',
  'anything': 'bất cứ điều gì',
  'something': 'điều gì đó',
  'everything': 'mọi thứ',
  'nothing': 'không có gì',

  // Prepositions & Conjunctions
  'because': 'bởi vì (liên từ + mệnh đề)',
  'because of': 'bởi vì, do (giới từ + cụm danh từ)',
  'due to': 'do, bởi vì (giới từ + cụm danh từ)',
  'owing to': 'do, nhờ có (giới từ + cụm danh từ)',
  'thanks to': 'nhờ có, nhờ vào',
  'although': 'mặc dù (liên từ + mệnh đề)',
  'even though': 'mặc dù, dẫu cho',
  'though': 'mặc dù',
  'despite': 'mặc dù, bất chấp (giới từ + cụm danh từ)',
  'in spite of': 'mặc dù, bất chấp (giới từ + cụm danh từ)',
  'while': 'trong khi (liên từ + mệnh đề / V-ing)',
  'during': 'trong suốt (giới từ + khoảng thời gian)',
  'unless': 'trừ khi, nếu không (liên từ)',
  'if': 'nếu, liệu rằng (liên từ)',
  'provided that': 'với điều kiện là, miễn là',
  'as long as': 'miễn là, chừng nào mà',
  'in order to': 'để, nhằm mục đích (+ V-inf)',
  'so that': 'để mà (+ mệnh đề)',
  'in order that': 'để mà (+ mệnh đề)',
  'prior to': 'trước khi (giới từ + Noun/V-ing)',
  'before': 'trước khi',
  'after': 'sau khi',
  'since': 'kể từ khi / bởi vì',
  'until': 'cho đến khi',
  'as soon as': 'ngay khi',
  'once': 'một khi đã',
  'whether': 'liệu rằng, cho dù',
  'instead of': 'thay vì (giới từ + Noun/V-ing)',
  'in addition to': 'ngoài ra, bên cạnh (+ Noun/V-ing)',
  'besides': 'ngoài ra, bên cạnh đó',
  'furthermore': 'hơn nữa, vả lại',
  'moreover': 'hơn nữa',
  'however': 'tuy nhiên',
  'therefore': 'do đó, vì vậy',
  'otherwise': 'nếu không thì, mặt khác',
  'as well as': 'cũng như, cùng với',
  'together with': 'cùng với',
  'such as': 'chẳng hạn như, ví dụ như',
  'for example': 'ví dụ như',

  // Common Verbs in Part 5
  'wait': 'chờ đợi, đón đợi',
  'decide': 'quyết định, định đoạt',
  'expect': 'dự kiến, kỳ vọng, lường trước',
  'figure': 'hình dung, tính toán, chỉ số',
  'recommend': 'khuyến nghị, giới thiệu',
  'recommends': 'khuyến nghị, khuyên bảo',
  'recommended': 'đã khuyến nghị, được giới thiệu',
  'recommending': 'đang khuyến nghị',
  'recommendation': 'sự khuyến nghị, lời khuyên',
  'consider': 'xem xét, cân nhắc',
  'considers': 'xem xét, cân nhắc',
  'considered': 'được xem xét, đã cân nhắc',
  'considering': 'xem xét, xét đến',
  'consideration': 'sự xem xét, sự cân nhắc',
  'considerable': 'đáng kể, to lớn',
  'considerably': 'đáng kể, nhiều',
  'require': 'yêu cầu, đòi hỏi',
  'requires': 'yêu cầu, bắt buộc',
  'required': 'được yêu cầu, bắt buộc',
  'requiring': 'yêu cầu',
  'requirement': 'yêu cầu, điều kiện tiên quyết',
  'submit': 'nộp, đệ trình (hồ sơ, báo cáo)',
  'submits': 'nộp, đệ trình',
  'submitted': 'đã nộp, được nộp',
  'submitting': 'đang nộp, việc nộp',
  'submission': 'sự nộp, bản đệ trình',
  'provide': 'cung cấp, đưa ra',
  'provides': 'cung cấp, đưa ra',
  'provided': 'được cung cấp, với điều kiện',
  'providing': 'cung cấp',
  'provision': 'sự cung cấp, điều khoản',
  'complete': 'hoàn thành, đầy đủ',
  'completes': 'hoàn thành',
  'completed': 'đã hoàn thành',
  'completing': 'việc hoàn thành',
  'completion': 'sự hoàn thành',
  'completely': 'hoàn toàn, trọn vẹn',
  'attend': 'tham dự, có mặt',
  'attends': 'tham dự',
  'attended': 'đã tham dự',
  'attending': 'đang tham dự',
  'attendance': 'sự tham dự, số người có mặt',
  'attendee': 'người tham dự',
  'inform': 'thông báo, cho biết',
  'informs': 'thông báo',
  'informed': 'đã thông báo, có hiểu biết',
  'informing': 'đang thông báo',
  'information': 'thông tin',
  'informative': 'chứa nhiều thông tin bổ ích',
  'confirm': 'xác nhận, khẳng định',
  'confirms': 'xác nhận',
  'confirmed': 'đã xác nhận',
  'confirming': 'đang xác nhận',
  'confirmation': 'sự xác nhận, giấy xác nhận',
  'approve': 'phê duyệt, chấp thuận',
  'approves': 'phê duyệt',
  'approved': 'đã được phê duyệt',
  'approving': 'việc phê duyệt',
  'approval': 'sự phê duyệt, sự chấp thuận',
  'manage': 'quản lý, xoay sở',
  'manages': 'quản lý',
  'managed': 'đã quản lý',
  'managing': 'việc quản lý',
  'management': 'ban quản lý, sự quản lý',
  'manager': 'người quản lý, trưởng phòng',
  'managerial': 'thuộc về quản lý',
  'develop': 'phát triển, mở rộng',
  'develops': 'phát triển',
  'developed': 'đã phát triển',
  'developing': 'đang phát triển',
  'development': 'sự phát triển',
  'developer': 'nhà phát triển',
  'operate': 'vận hành, hoạt động',
  'operates': 'vận hành, hoạt động',
  'operated': 'đã vận hành',
  'operating': 'hoạt động, vận hành',
  'operation': 'sự vận hành, hoạt động',
  'operational': 'sẵn sàng hoạt động',
  'increase': 'tăng lên, sự gia tăng',
  'increases': 'tăng lên',
  'increased': 'đã tăng lên',
  'increasing': 'ngày càng tăng',
  'increasingly': 'ngày càng, càng ngày càng',
  'reduce': 'giảm, cắt giảm',
  'reduces': 'giảm',
  'reduced': 'đã giảm, được cắt giảm',
  'reducing': 'việc cắt giảm',
  'reduction': 'sự cắt giảm, sự suy giảm',
  'maintain': 'duy trì, bảo dưỡng, bảo trì',
  'maintains': 'duy trì, bảo dưỡng',
  'maintained': 'được duy trì, đã bảo dưỡng',
  'maintaining': 'việc duy trì',
  'maintenance': 'sự bảo trì, bảo dưỡng',
  'receive': 'nhận được',
  'receives': 'nhận được',
  'received': 'đã nhận được',
  'receiving': 'việc nhận',
  'receipt': 'biên lai, hóa đơn, sự nhận',
  'reception': 'tiệc chiêu đãi, sự đón tiếp',
  'recipient': 'người nhận',
  'distribute': 'phân phối, phát tán',
  'distributes': 'phân phối',
  'distributed': 'được phân phối',
  'distributing': 'việc phân phối',
  'distribution': 'sự phân phối',
  'distributor': 'nhà phân phối',

  // Common Adjectives & Adverbs
  'frequent': 'thường xuyên',
  'frequently': 'một cách thường xuyên',
  'frequency': 'tần suất',
  'recent': 'gần đây',
  'recently': 'gần đây, mới đây',
  'final': 'cuối cùng, chung kết',
  'finally': 'cuối cùng thì',
  'finalize': 'hoàn tất, chốt lại',
  'direct': 'trực tiếp, thẳng',
  'directly': 'một cách trực tiếp',
  'direction': 'hướng đi, sự hướng dẫn',
  'director': 'giám đốc, đạo diễn',
  'clear': 'rõ ràng, trong sạch',
  'clearly': 'một cách rõ ràng',
  'clarify': 'làm rõ, giải thích rõ',
  'clarity': 'sự rõ ràng, sáng sủa',
  'quick': 'nhanh chóng',
  'quickly': 'một cách nhanh chóng',
  'prompt': 'nhanh chóng, tức thì',
  'promptly': 'ngay lập tức, đúng giờ',
  'accurate': 'chính xác, đúng đắn',
  'accurately': 'một cách chính xác',
  'accuracy': 'sự chính xác, độ chính xác',
  'efficient': 'hiệu quả, năng suất cao',
  'efficiently': 'một cách hiệu quả',
  'efficiency': 'hiệu quả, hiệu suất',
  'effective': 'có hiệu lực, hiệu quả',
  'effectively': 'một cách hiệu quả',
  'effectiveness': 'tính hiệu quả',
  'perfect': 'hoàn hảo',
  'perfects': 'làm cho hoàn hảo',
  'perfected': 'đã hoàn thiện',
  'perfecting': 'hoàn thiện',
  'perfection': 'sự hoàn hảo',
  'perfectible': 'có thể hoàn thiện',
  'perfectibility': 'khả năng hoàn thiện',
  'perfecter': 'người hoàn thiện',
  'perfectest': 'hoàn hảo nhất',
  'perfective': 'hoàn thành',
  'perfectively': 'một cách hoàn thành',
  'perfectiveness': 'tính hoàn thành',
  'perfectness': 'tính hoàn hảo',
  'perfects': 'hoàn thiện',
  'perfected': 'đã hoàn thiện',
  'perfecting': 'đang hoàn thiện',
  'perfects': 'hoàn thiện',
  'perfected': 'đã hoàn hảo',
  'perfects': 'hoàn thiện',
  'perfects': 'hoàn hảo',
  'perfects': 'hoàn chỉnh',
  'perfects': 'chính xác',
  'perfects': 'hoàn mỹ',
  'perfects': 'chuẩn mực',
  'perfects': 'tuyệt đối',
  'perfects': 'tuyệt vời',
  'perfectly': 'hoàn hảo, tuyệt đối',
  'initial': 'ban đầu',
  'initially': 'ban đầu, lúc đầu',
  'initiate': 'khởi xướng, bắt đầu',
  'initiative': 'sáng kiến, sự chủ động',
  'original': 'nguyên bản, ban đầu',
  'originally': 'ban đầu, vốn dĩ',
  'originality': 'tính độc đáo, sự sáng tạo',
  'financial': 'thuộc về tài chính',
  'financially': 'về mặt tài chính',
  'finance': 'tài chính, cấp vốn',
  'finances': 'tài chính',
  'professional': 'chuyên nghiệp, giới chuyên gia',
  'professionally': 'một cách chuyên nghiệp',
  'profession': 'nghề nghiệp',
  'successful': 'thành công',
  'successfully': 'một cách thành công',
  'success': 'sự thành công',
  'succeed': 'thành công, kế nhiệm',
  'significant': 'đáng kể, quan trọng',
  'significantly': 'một cách đáng kể',
  'significance': 'tầm quan trọng, ý nghĩa',
  'temporary': 'tạm thời',
  'temporarily': 'một cách tạm thời',
  'permanent': 'vĩnh viễn, lâu dài',
  'permanently': 'một cách vĩnh viễn',
  'convenient': 'tiện lợi, thuận tiện',
  'conveniently': 'một cách thuận tiện',
  'convenience': 'sự tiện lợi',
  'available': 'có sẵn, rảnh rỗi',
  'availability': 'tình trạng có sẵn',
  'reliable': 'đáng tin cậy',
  'reliably': 'một cách đáng tin cậy',
  'reliability': 'độ tin cậy',
  'rely': 'dựa vào, tin cậy',
  'safe': 'an toàn',
  'safely': 'một cách an toàn',
  'safety': 'sự an toàn',
  'secure': 'an toàn, bảo mật, đảm bảo',
  'securely': 'một cách an toàn, chắc chắn',
  'security': 'an ninh, sự bảo mật',
  'thorough': 'kỹ lưỡng, thấu đáo',
  'thoroughly': 'một cách kỹ lưỡng',
  'broad': 'rộng lớn, bao quát',
  'broadly': 'một cách rộng rãi',
  'broaden': 'mở rộng',
  'wide': 'rộng, phong phú',
  'widely': 'rộng rãi, phần lớn',
  'widen': 'mở rộng',
  'high': 'cao',
  'highly': 'rất, hết sức, đánh giá cao',
  'height': 'chiều cao',
  'deep': 'sâu',
  'deeply': 'sâu sắc',
  'depth': 'độ sâu',
  'regular': 'thường xuyên, đều đặn',
  'regularly': 'một cách đều đặn',
  'exception': 'ngoại lệ',
  'exceptional': 'xuất chúng, đặc biệt',
  'exceptionally': 'một cách xuất chúng, hiếm có',
  'compete': 'cạnh tranh, thi đấu',
  'competitive': 'có tính cạnh tranh',
  'competitively': 'một cách cạnh tranh',
  'competition': 'sự cạnh tranh, cuộc thi',
  'competitor': 'đối thủ cạnh tranh',
  'innovate': 'đổi mới, cách tân',
  'innovative': 'mang tính đổi mới, sáng tạo',
  'innovation': 'sự đổi mới, sáng kiến',
  'satisfy': 'làm hài lòng, đáp ứng',
  'satisfied': 'hài lòng',
  'satisfying': 'đem lại sự hài lòng',
  'satisfactory': 'thỏa đáng, vừa ý',
  'satisfaction': 'sự hài lòng, thỏa mãn',
  'flexible': 'linh hoạt',
  'flexibly': 'một cách linh hoạt',
  'flexibility': 'sự linh hoạt',
  'productive': 'năng suất cao, hiệu quả',
  'productively': 'một cách hiệu quả',
  'productivity': 'năng suất lao động',
  'product': 'sản phẩm',
  'produce': 'sản xuất, nông sản',
  'producer': 'nhà sản xuất'
};

const ROOT_VERB_MAP = {
  'end': 'kết thúc, chấm dứt',
  'close': 'đóng cửa, kết thúc',
  'inspect': 'kiểm tra, thanh tra',
  'expand': 'mở rộng, phát triển',
  'approve': 'phê duyệt, chấp thuận',
  'inform': 'thông báo, cho biết',
  'confirm': 'xác nhận',
  'decide': 'quyết định',
  'expect': 'dự kiến, kỳ vọng, lường trước',
  'wait': 'chờ đợi, đón đợi',
  'figure': 'hình dung, tính toán',
  'provide': 'cung cấp',
  'complete': 'hoàn thành',
  'submit': 'nộp, đệ trình',
  'receive': 'nhận được',
  'attend': 'tham dự',
  'manage': 'quản lý',
  'develop': 'phát triển',
  'operate': 'vận hành',
  'reduce': 'cắt giảm, giảm bớt',
  'increase': 'gia tăng, tăng lên',
  'maintain': 'duy trì, bảo dưỡng',
  'distribute': 'phân phối',
  'recommend': 'khuyến nghị, giới thiệu',
  'consider': 'xem xét, cân nhắc',
  'require': 'yêu cầu, bắt buộc'
};

function translateGrammarVerbPhrase(cleanLower) {
  let match = cleanLower.match(/^will\s+be\s+([a-z]+)ing$/i);
  if (match) {
    const root = match[1].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[1]] || ROOT_VERB_MAP[root + 'e'] || match[1];
    return `sẽ ${viRoot} (thì tương lai tiếp diễn)`;
  }
  match = cleanLower.match(/^(has|have)\s+been\s+([a-z]+)ing$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `đã và đang ${viRoot} (hiện tại hoàn thành tiếp diễn)`;
  }
  match = cleanLower.match(/^(has|have|had)\s+([a-z]+)(ed|en|t)$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `đã ${viRoot} (thì hoàn thành)`;
  }
  match = cleanLower.match(/^(is|are|was|were)\s+([a-z]+)(ed|en|t)$/i);
  if (match) {
    const root = match[2].replace(/e$/, '');
    const viRoot = ROOT_VERB_MAP[root] || ROOT_VERB_MAP[match[2]] || ROOT_VERB_MAP[root + 'e'] || match[2];
    return `được / bị ${viRoot} (thể bị động)`;
  }
  match = cleanLower.match(/^will\s+([a-z]+)$/i);
  if (match) {
    const viRoot = ROOT_VERB_MAP[match[1]] || match[1];
    return `sẽ ${viRoot} (thì tương lai đơn)`;
  }
  match = cleanLower.match(/^to\s+([a-z]+)$/i);
  if (match) {
    const viRoot = ROOT_VERB_MAP[match[1]] || match[1];
    return `để ${viRoot} (dạng to-V)`;
  }
  if (cleanLower.endsWith('ed')) {
    const root1 = cleanLower.replace(/ed$/, '');
    const root2 = cleanLower.replace(/d$/, '');
    const viRoot = ROOT_VERB_MAP[cleanLower] || ROOT_VERB_MAP[root1] || ROOT_VERB_MAP[root1 + 'e'] || ROOT_VERB_MAP[root2];
    if (viRoot) return `đã / được ${viRoot}`;
  }
  if (cleanLower.endsWith('ing')) {
    const root1 = cleanLower.replace(/ing$/, '');
    const viRoot = ROOT_VERB_MAP[cleanLower] || ROOT_VERB_MAP[root1] || ROOT_VERB_MAP[root1 + 'e'];
    if (viRoot) return `đang / việc ${viRoot}`;
  }
  return null;
}

function translateOptionText(text) {
  if (!text) return '';
  const clean = text.trim().toLowerCase();
  
  // 1. Direct dictionary match
  if (READING_OPTION_DICT[clean]) {
    return READING_OPTION_DICT[clean];
  }

  // 2. Dynamic grammar verb phrase
  const grammar = translateGrammarVerbPhrase(clean);
  if (grammar) return grammar;

  // 3. Multi-word phrase or short sentence
  if (clean.includes(' ')) {
    const parts = clean.split(' ');
    if (parts[0] === 'to' && parts.length >= 2) {
      const verb = parts.slice(1).join(' ');
      const verbTrans = READING_OPTION_DICT[verb] || verb;
      return `Để ${verbTrans}`;
    }
  }

  // 4. Suffix heuristics
  if (clean.endsWith('ly')) {
    const root = clean.replace(/ly$/, '');
    const rootTrans = READING_OPTION_DICT[root] || root;
    return `một cách ${rootTrans} (trạng từ)`;
  }
  if (clean.endsWith('tion') || clean.endsWith('sion') || clean.endsWith('ment') || clean.endsWith('ness') || clean.endsWith('ity')) {
    return `sự / việc ${clean} (danh từ)`;
  }
  if (clean.endsWith('able') || clean.endsWith('ible') || clean.endsWith('ive') || clean.endsWith('ful') || clean.endsWith('ous')) {
    return `có tính ${clean} (tính từ)`;
  }

  return text;
}

module.exports = {
  READING_OPTION_DICT,
  translateOptionText
};
