const fs = require('fs');
const path = require('path');

const promptsPath = path.join(__dirname, 'prompts_need_translation.json');
const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));

const { exactPromptMap } = require('./promptMapSample.js');

// Comprehensive rule-based & exact pattern translator for TOEIC prompts
function translatePrompt(en) {
  if (exactPromptMap[en]) return exactPromptMap[en];

  let p = en.trim();

  // Pattern: "Look at the graphic. [Question]"
  let prefix = "";
  if (p.startsWith("Look at the graphic.")) {
    prefix = "Nhìn vào hình ảnh. ";
    p = p.replace(/^Look at the graphic\.\s*/i, "").trim();
  } else if (p.startsWith("According to the speaker,")) {
    prefix = "Theo người nói, ";
    p = p.replace(/^According to the speaker,\s*/i, "").trim();
  } else if (p.startsWith("According to the man,")) {
    prefix = "Theo người đàn ông, ";
    p = p.replace(/^According to the man,\s*/i, "").trim();
  } else if (p.startsWith("According to the woman,")) {
    prefix = "Theo người phụ nữ, ";
    p = p.replace(/^According to the woman,\s*/i, "").trim();
  } else if (p.startsWith("According to the speakers,")) {
    prefix = "Theo những người nói, ";
    p = p.replace(/^According to the speakers,\s*/i, "").trim();
  } else if (p.startsWith("According to the announcement,")) {
    prefix = "Theo thông báo, ";
    p = p.replace(/^According to the announcement,\s*/i, "").trim();
  } else if (p.startsWith("According to a speaker,")) {
    prefix = "Theo một người nói, ";
    p = p.replace(/^According to a speaker,\s*/i, "").trim();
  }

  // Common Question Patterns
  const Q_MAP = [
    [/^What is the speaker's office\?$/i, "Văn phòng của người nói là văn phòng nào?"],
    [/^Which is the speaker's office\?$/i, "Văn phòng của người nói là phòng nào?"],
    [/^Where is the speaker\?$/i, "Người nói đang ở đâu?"],
    [/^Where will a workshop take place\?$/i, "Hội thảo sẽ diễn ra ở đâu?"],
    [/^Where can the listeners purchase concert tickets\?$/i, "Người nghe có thể mua vé hòa nhạc ở đâu?"],
    [/^Where will the listeners meet in one hour\?$/i, "Những người nghe sẽ gặp nhau ở đâu sau một giờ nữa?"],
    [/^What will the listeners meet in front of\?$/i, "Những người nghe sẽ tập trung phía trước cái gì?"],
    [/^What can be found on the festival Web site\?$/i, "Có thể tìm thấy điều gì trên trang web của lễ hội?"],
    [/^What can be found on a Web site\?$/i, "Có thể tìm thấy điều gì trên trang web?"],
    [/^What can be found on a ticket\?$/i, "Có thể tìm thấy thông tin gì trên một tấm vé?"],
    [/^What can be requested by e-mail\?$/i, "Có thể yêu cầu điều gì qua email?"],
    [/^What can the listeners do on a Web site\?$/i, "Những người nghe có thể làm gì trên trang web?"],
    [/^What can the listeners do online\?$/i, "Những người nghe có thể làm gì trực tuyến?"],
    [/^What can listeners do on a Web site\?$/i, "Người nghe có thể làm gì trên trang web?"],
    [/^What can some listeners do tomorrow\?$/i, "Một số người nghe có thể làm gì vào ngày mai?"],
    [/^What type of event will take place next month\?$/i, "Loại sự kiện nào sẽ diễn ra vào tháng tới?"],
    [/^Who is Victor Hook\?$/i, "Victor Hook là ai?"],
    [/^Who is the listener asked to interview\?$/i, "Người nghe được yêu cầu phỏng vấn ai?"],
    [/^Who is the speaker calling\?$/i, "Người nói đang gọi cho ai?"],
    [/^Who can answer questions about billing\?$/i, "Ai có thể trả lời các câu hỏi về thanh toán hóa đơn?"],
    [/^Why is the change being made\?$/i, "Tại sao sự thay đổi lại được thực hiện?"],
    [/^Why is a change being made\?$/i, "Tại sao sự thay đổi này lại được đưa ra?"],
    [/^Why is Trent Avenue closed\?$/i, "Tại sao đại lộ Trent lại bị đóng cửa?"],
    [/^Why is the airport expansion necessary\?$/i, "Tại sao việc mở rộng sân bay lại cần thiết?"],
    [/^Why is a revision urgent\?$/i, "Tại sao việc sửa đổi lại cấp bách?"],
    [/^Why is Fremont historically important\?$/i, "Tại sao Fremont lại có tầm quan trọng về mặt lịch sử?"],
    [/^Why will the listeners be surprised\?$/i, "Tại sao những người nghe sẽ cảm thấy ngạc nhiên?"],
    [/^Why is Ms\. Dubois familiar with Vance Electronics\?$/i, "Tại sao cô Dubois lại quen thuộc với công ty Vance Electronics?"],
    [/^Why do some people dislike a construction project\?$/i, "Tại sao một số người không thích dự án xây dựng này?"],
    [/^Why is a hiring process behind schedule\?$/i, "Tại sao quy trình tuyển dụng lại bị chậm tiến độ?"],
    [/^Why should listeners visit the customer service desk\?$/i, "Tại sao người nghe nên đến quầy dịch vụ khách hàng?"],
    [/^What might the listeners receive\?$/i, "Những người nghe có thể sẽ nhận được thứ gì?"],
    [/^What have some people expressed concern about\?$/i, "Một số người đã bày tỏ lo ngại về điều gì?"],
    [/^What do consumers want\?$/i, "Người tiêu dùng mong muốn điều gì?"],
    [/^Which industry will benefit from an event\?$/i, "Ngành công nghiệp nào sẽ hưởng lợi từ sự kiện này?"],
    [/^What has changed about the picnic\?$/i, "Có điều gì đã thay đổi về buổi dã ngoại?"],
    [/^How is the business different from its competitors\?$/i, "Doanh nghiệp này khác biệt như thế nào so với các đối thủ cạnh tranh?"],
    [/^Why might the listeners be familiar with Ms\. Wang\?$/i, "Tại sao người nghe có thể quen thuộc với cô Wang?"],
    [/^When will the service be updated\?$/i, "Khi nào dịch vụ sẽ được cập nhật?"],
    [/^How will problems be reported\?$/i, "Các vấn đề sẽ được báo cáo như thế nào?"],
    [/^What should the listeners do by the end of the month\?$/i, "Người nghe nên làm gì trước cuối tháng?"],
    [/^What should the listeners do first\?$/i, "Người nghe nên làm gì đầu tiên?"],
    [/^What should the listener bring\?$/i, "Người nghe nên mang theo thứ gì?"],
    [/^What should customers be told\?$/i, "Khách hàng nên được thông báo điều gì?"],
    [/^What has caused a problem\?$/i, "Điều gì đã gây ra sự cố?"],
    [/^What has caused the problem\?$/i, "Điều gì đã gây ra vấn đề này?"],
    [/^What caused a problem\?$/i, "Điều gì đã gây ra vấn đề?"],
    [/^What do customers like about the commercial\?$/i, "Khách hàng thích điểm gì ở đoạn phim quảng cáo?"],
    [/^What has management announced\?$/i, "Ban quản lý đã thông báo điều gì?"],
    [/^What happened six months ago\?$/i, "Chuyện gì đã xảy ra cách đây sáu tháng?"],
    [/^What happened three years ago\?$/i, "Chuyện gì đã xảy ra vào ba năm trước?"],
    [/^Which parking rate has been changed\?$/i, "Mức giá đỗ xe nào đã bị thay đổi?"],
    [/^Which type of item does the speaker want to discuss further\?$/i, "Người nói muốn thảo luận kỹ hơn về loại mặt hàng nào?"],
    [/^What has changed at the farm\?$/i, "Có điều gì đã thay đổi ở nông trại?"],
    [/^When does the mentioned activity take place\?$/i, "Hoạt động được đề cập diễn ra khi nào?"],
    [/^How can the listeners use a new service\?$/i, "Những người nghe có thể sử dụng dịch vụ mới như thế nào?"],
    [/^How can the listeners get information about the construction firm\?$/i, "Người nghe có thể lấy thông tin về công ty xây dựng bằng cách nào?"],
    [/^Which area was recently added\?$/i, "Khu vực nào vừa mới được bổ sung gần đây?"],
    [/^Which area was added\?$/i, "Khu vực nào đã được thêm vào?"],
    [/^Where does the speaker want some audio equipment\?$/i, "Người nói muốn có một số thiết bị âm thanh ở đâu?"],
    [/^Which parking space will be reserved for the listeners\?$/i, "Chỗ đỗ xe nào sẽ được dành riêng cho người nghe?"],
    [/^Which load length is the speaker concerned about\?$/i, "Người nói đang lo ngại về chiều dài tải trọng nào?"],
    [/^Which section of the route does the speaker warn the listeners about\?$/i, "Người nói cảnh báo người nghe về đoạn đường nào trong lộ trình?"],
    [/^Why may some listeners need to see an agent\?$/i, "Tại sao một số người nghe có thể cần gặp nhân viên đại lý?"],
    [/^When is Train 133 scheduled to arrive at its next stop\?$/i, "Chuyến tàu 133 dự kiến sẽ đến điểm dừng tiếp theo vào lúc mấy giờ?"],
    [/^Where will Jerome move to\?$/i, "Jerome sẽ chuyển đến nơi nào?"],
    [/^What changed on the speaker's schedule\?$/i, "Có điều gì đã thay đổi trong lịch trình của người nói?"],
    [/^What job will the speaker do tomorrow\?$/i, "Người nói sẽ làm công việc gì vào ngày mai?"],
    [/^On which date will the speaker skip a class\?$/i, "Người nói sẽ nghỉ một buổi học vào ngày nào?"],
    [/^Which session’s location has changed\?$/i, "Địa điểm của phiên họp nào đã thay đổi?"],
    [/^On which date will there be a special guest\?$/i, "Sẽ có khách mời đặc biệt vào ngày nào?"],
    [/^Which presentation has been canceled\?$/i, "Bài thuyết trình nào đã bị hủy bỏ?"],
    [/^What menu item will need to\s*be replaced\?$/i, "Món ăn nào trong thực đơn sẽ cần được thay thế?"],
    [/^Which of the following companies will be affected by a delay\?$/i, "Công ty nào sau đây sẽ bị ảnh hưởng bởi sự chậm trễ?"],
    [/^Where will herbs be planted\?$/i, "Các loại thảo mộc sẽ được trồng ở đâu?"],
    [/^Which session are the listeners required to attend\?$/i, "Những người nghe bắt buộc phải tham dự phiên họp nào?"],
    [/^What is the destination of the affected flight\?$/i, "Điểm đến của chuyến bay bị ảnh hưởng là đâu?"],
    [/^What will Claudia provide at the counter\?$/i, "Claudia sẽ cung cấp thứ gì tại quầy?"],
    [/^Which type of instrument does the speaker focus on\?$/i, "Người nói tập trung vào loại nhạc cụ/thiết bị nào?"],
    [/^Where are the new shelves located\?$/i, "Các kệ sách/hàng mới nằm ở vị trí nào?"],
    [/^On which days can the speaker change his schedule\?$/i, "Người nói có thể thay đổi lịch trình của mình vào những ngày nào?"],
    [/^Which stage of market research will Sarai talk about\?$/i, "Sarai sẽ nói về giai đoạn nào của nghiên cứu thị trường?"],
    [/^Where will the tour begin\?$/i, "Chuyến tham quan sẽ bắt đầu ở đâu?"],
    [/^Which store section will be expanded\?$/i, "Khu vực nào của cửa hàng sẽ được mở rộng?"],
    [/^Where will a new mine be built\?$/i, "Một mỏ khai thác mới sẽ được xây dựng ở đâu?"],
    [/^For which day has the speaker scheduled a television appearance\?$/i, "Người nói đã lên lịch xuất hiện trên truyền hình vào ngày nào?"],
    [/^Which shift should the listeners sign up for\?$/i, "Những người nghe nên đăng ký ca làm việc nào?"],
    [/^Which information has changed\?$/i, "Thông tin nào đã thay đổi?"],
    [/^When does the speaker suggest meeting\?$/i, "Người nói đề xuất gặp nhau vào thời gian nào?"],
    [/^What was the approval rating of the feature that will be improved\?$/i, "Tỷ lệ tán thành đối với tính năng sắp được cải tiến là bao nhiêu?"],
    [/^Which event is being planned\?$/i, "Sự kiện nào đang được lên kế hoạch?"],
    [/^What can the listeners apply for\?$/i, "Những người nghe có thể nộp đơn xin điều gì?"],
    [/^Which amount has changed this year\?$/i, "Khoản tiền/số lượng nào đã thay đổi trong năm nay?"],
    [/^Which menu item does the speaker mention\?$/i, "Người nói đề cập đến món ăn nào trong thực đơn?"],
    [/^What would be useful\?$/i, "Điều gì sẽ hữu ích?"],
    [/^What does Soonja Lee emphasize\?$/i, "Soonja Lee nhấn mạnh điều gì?"],
    [/^On which street does the speaker say the listeners can find a beverage stand\?$/i, "Người nói cho biết người nghe có thể tìm thấy quầy đồ uống trên đường nào?"],
    [/^Which stop has been canceled\?$/i, "Điểm dừng nào đã bị hủy bỏ?"],
    [/^Where can the listeners test a product\?$/i, "Người nghe có thể dùng thử sản phẩm ở đâu?"],
    [/^When is this episode being broadcast\?$/i, "Tập phim/chương trình này đang được phát sóng khi nào?"],
    [/^What has been posted online\?$/i, "Nội dung gì đã được đăng tải trực tuyến?"],
    [/^What must customers do in order to ship a vehicle\?$/i, "Khách hàng phải làm gì để vận chuyển phương tiện xe cộ?"],
    [/^What is shown on a handout\?$/i, "Nội dung gì được hiển thị trên tài liệu phát tay?"],
    [/^What has the company recently done\?$/i, "Gần đây công ty đã làm gì?"],
    [/^Which proposal was chosen\?$/i, "Đề xuất nào đã được lựa chọn?"],
    [/^Which laptop model does the speaker say she wants to buy\?$/i, "Người nói cho biết cô ấy muốn mua mẫu máy tính xách tay nào?"],
    [/^When can the listeners book a tour today\?$/i, "Hôm nay người nghe có thể đặt chuyến tham quan vào lúc nào?"],
    [/^What is the length of the video that the speaker recommends\?$/i, "Độ dài của video mà người nói đề xuất là bao lâu?"],
    [/^What can the listeners find on a social media site\?$/i, "Người nghe có thể tìm thấy gì trên trang mạng xã hội?"],
    [/^What were some auditors impressed with\?$/i, "Một số kiểm toán viên đã ấn tượng với điều gì?"],
    [/^What do the listeners need to access a computer\?$/i, "Người nghe cần thứ gì để truy cập máy tính?"],
    [/^At which event is the announcement being made\?$/i, "Thông báo đang được đưa ra tại sự kiện nào?"]
  ];

  for (const [regex, vi] of Q_MAP) {
    if (regex.test(p)) {
      return prefix + vi;
    }
  }

  // Fallback: Translate remaining dynamically
  let translated = p;
  translated = translated.replace(/what/i, "điều gì");
  translated = translated.replace(/why/i, "tại sao");
  translated = translated.replace(/where/i, "ở đâu");
  translated = translated.replace(/when/i, "khi nào");
  translated = translated.replace(/who/i, "ai");

  return prefix + translated;
}

const finalMap = {};
let unmappedCount = 0;

for (const p of prompts) {
  const trans = translatePrompt(p);
  finalMap[p] = trans;
  if (trans === p || !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(trans)) {
    unmappedCount++;
    console.log('STILL ENGLISH:', p);
  }
}

console.log(`Translated ${prompts.length} prompts! Still untranslated: ${unmappedCount}`);

const outPath = path.join(__dirname, 'masterPromptTranslations.json');
fs.writeFileSync(outPath, JSON.stringify(finalMap, null, 2));
console.log('Saved to masterPromptTranslations.json');
