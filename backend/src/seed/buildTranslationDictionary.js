const fs = require('fs');

const filePath = 'C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/defective_texts.json';
const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Curated comprehensive translation dictionary for TOEIC
const DICT = {
  // Grammar & Parts of speech
  "động từ": "Động từ",
  "tính từ": "Tính từ",
  "trạng từ": "Trạng từ",
  "danh từ": "Danh từ",
  "after": "Sau khi / Sau",
  "After": "Sau khi / Sau",
  "that": "Rằng / Điều đó / Người/vật mà",
  "That": "Rằng / Điều đó / Người/vật mà",
  "high": "Cao / Mức độ cao",
  "as soon as": "Ngay khi",
  "As soon as": "Ngay khi",
  "constructor": "Nhà thầu xây dựng / Người xây dựng",
  "across": "Băng qua / Ngang qua",
  "around": "Xung quanh / Khoảng chừng",
  "winner": "Người chiến thắng",
  "purchaser": "Người mua hàng",
  "purchasers": "Những người mua hàng",
  "participate": "Tham gia",
  "well": "Tốt / Giếng nước / Rất",
  "specifies": "Chỉ rõ / Nêu cụ thể",
  "will be held": "Sẽ được tổ chức",
  "12 inches": "12 inch (khoảng 30 cm)",
  "10:00 a.m.": "10:00 sáng",
  "10:00 A.M.": "10:00 sáng",

  // Café & Résumé Phrases
  "at a café": "Tại một quán cà phê",
  "At a café": "Tại một quán cà phê",
  "a résumé": "Một bản sơ yếu lý lịch",
  "A résumé": "Một bản sơ yếu lý lịch",
  "a café": "Một quán cà phê",
  "A café": "Một quán cà phê",
  "update a résumé": "Cập nhật sơ yếu lý lịch",
  "Update a résumé": "Cập nhật sơ yếu lý lịch",
  "review some résumés": "Xem lại một số bản sơ yếu lý lịch",
  "Review some résumés": "Xem lại một số bản sơ yếu lý lịch",
  "print out her résumé": "In sơ yếu lý lịch của cô ấy",
  "Print out her résumé": "In sơ yếu lý lịch của cô ấy",
  "the café project": "Dự án quán cà phê",
  "The café project": "Dự án quán cà phê",
  "update her résumé": "Cập nhật sơ yếu lý lịch của cô ấy",
  "Update her résumé": "Cập nhật sơ yếu lý lịch của cô ấy",
  "next to a café": "Bên cạnh một quán cà phê",
  "Next to a café": "Bên cạnh một quán cà phê",
  "send a résumé": "Gửi một bản sơ yếu lý lịch",
  "Send a résumé": "Gửi một bản sơ yếu lý lịch",
  "review a résumé": "Xem lại sơ yếu lý lịch",
  "Review a résumé": "Xem lại sơ yếu lý lịch",
  "forward some résumés": "Chuyển tiếp một số bản sơ yếu lý lịch",
  "Forward some résumés": "Chuyển tiếp một số bản sơ yếu lý lịch",
  "update his résumé": "Cập nhật sơ yếu lý lịch của anh ấy",
  "Update his résumé": "Cập nhật sơ yếu lý lịch của anh ấy",
  "print out some résumés": "In một số bản sơ yếu lý lịch",
  "Print out some résumés": "In một số bản sơ yếu lý lịch",
  "its in-store café": "Quán cà phê bên trong cửa hàng",
  "Its in-store café": "Quán cà phê bên trong cửa hàng",
  "eat at a café": "Ăn tại một quán cà phê",
  "Eat at a café": "Ăn tại một quán cà phê",
  "rashid's résumé is out of date": "Sơ yếu lý lịch của Rashid đã hết hạn / lỗi thời",
  "Rashid's résumé is out of date": "Sơ yếu lý lịch của Rashid đã hết hạn / lỗi thời",
  "at city vegetarian café": "Tại quán cà phê chay City Vegetarian Café",
  "At City Vegetarian Café": "Tại quán cà phê chay City Vegetarian Café",
  "a café owner": "Một chủ quán cà phê",
  "A café owner": "Một chủ quán cà phê",
  "visiting a café": "Đến thăm một quán cà phê",
  "Visiting a café": "Đến thăm một quán cà phê",
  "work on a résumé": "Hoàn thiện / làm sơ yếu lý lịch",
  "Work on a résumé": "Hoàn thiện / làm sơ yếu lý lịch",
  "give the listener a résumé": "Đưa cho người nghe một bản sơ yếu lý lịch",
  "Give the listener a résumé": "Đưa cho người nghe một bản sơ yếu lý lịch",
  "the cafés will need to hire more cooks": "Các quán cà phê sẽ cần tuyển thêm đầu bếp",
  "The cafés will need to hire more cooks": "Các quán cà phê sẽ cần tuyển thêm đầu bếp",
  "the owners will visit each café next week": "Các chủ sở hữu sẽ đến thăm từng quán cà phê vào tuần tới",
  "The owners will visit each café next week": "Các chủ sở hữu sẽ đến thăm từng quán cà phê vào tuần tới",
  "a change to the café menus": "Một sự thay đổi đối với thực đơn của quán cà phê",
  "A change to the café menus": "Một sự thay đổi đối với thực đơn của quán cà phê",

  // Pages & Frames
  "page 1": "Trang 1",
  "Page 1": "Trang 1",
  "page 2": "Trang 2",
  "Page 2": "Trang 2",
  "page 3": "Trang 3",
  "Page 3": "Trang 3",
  "page 4": "Trang 4",
  "Page 4": "Trang 4",
  "frame 1": "Khung 1",
  "Frame 1": "Khung 1",
  "frame 2": "Khung 2",
  "Frame 2": "Khung 2",
  "frame 3": "Khung 3",
  "Frame 3": "Khung 3",
  "frame 4": "Khung 4",
  "Frame 4": "Khung 4",

  // Flowers & Objects
  "flowers": "Hoa / Các loài hoa",
  "Flowers": "Hoa / Các loài hoa",
  "tulips": "Hoa tulip",
  "Tulips": "Hoa tulip",
  "orchids": "Hoa phong lan",
  "Orchids": "Hoa phong lan",
  "roses": "Hoa hồng",
  "Roses": "Hoa hồng",
  "daisies": "Hoa cúc",
  "Daisies": "Hoa cúc",

  // Proper Nouns & Locations
  "los angeles": "Thành phố Los Angeles",
  "Los Angeles": "Thành phố Los Angeles",
  "ashburn": "Khu vực Ashburn",
  "Ashburn": "Khu vực Ashburn",
  "winnipeg": "Thành phố Winnipeg",
  "Winnipeg": "Thành phố Winnipeg",
  "toronto": "Thành phố Toronto",
  "Toronto": "Thành phố Toronto",
  "dublin": "Thành phố Dublin",
  "Dublin": "Thành phố Dublin",
  "maria": "Maria",
  "Maria": "Maria",
  "lior": "Lior",
  "Lior": "Lior"
};

// Check which items are already mapped vs unmapped
const unmapped = [];
for (const item of list) {
  const t = item.text.trim();
  if (DICT[t] || DICT[t.toLowerCase()]) continue;
  // If pure number/currency
  if (/^[\$€£]?\d+([,\.]\d+)?%?$/.test(t)) {
    DICT[t] = t;
    continue;
  }
  unmapped.push(item);
}

console.log(`Mapped items: ${list.length - unmapped.length}`);
console.log(`Unmapped items: ${unmapped.length}`);
fs.writeFileSync('C:/Users/ANH TUONG/.gemini/antigravity-ide/brain/0c604280-f87d-4c5d-80ee-c218cb4c2672/unmapped.json', JSON.stringify(unmapped, null, 2));
console.log('Saved unmapped to unmapped.json');
