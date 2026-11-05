# 🎧 KỊCH BẢN THUYẾT TRÌNH SDD (PHIÊN BẢN GÃY GỌN & DỄ HIỂU NHẤT)
> **Tài liệu độc quyền dành cho ứng viên**: Đặng Anh Tường  
> **Vị trí**: AI Product / Software Engineer Intern — Nexlab Technology  
> **Bộ Slide tương ứng**: `A:\nexlab_test\NEXLAB_DAY3_SLIDES_DANGANHTUONG.pptx` (14 Slides)  
> **Thời lượng chuẩn**: **8 – 9 phút thuyết trình** (Thư thái, gãy gọn, dứt khoát) + **8 phút Q&A**

---

## 💡 BÍ QUYẾT ĂN ĐIỂM: "GIẢI THÍCH ĐIỀU PHỨC TẠP BẰNG CÁCH NÓI ĐƠN GIẢN"
* **Không đọc vẹt từng chữ trên slide**: Slide đã có chữ rồi, miệng bạn chỉ nói **bản chất, số liệu và câu chuyện thực tế**.
* **Tông giọng**: Tự nhiên như đang trao đổi giải pháp cùng đồng nghiệp, tự tin, rõ ràng, mắt nhìn thẳng vào camera/người phỏng vấn.
* **Thời gian mỗi slide**: Chỉ từ **30 đến 40 giây** (khoảng 3 – 4 câu nói đắt giá).

---

## 🎬 LỜI THOẠI CHI TIẾT TỪNG SLIDE (14 SLIDES)

---

### 🎙️ SLIDE 1: BÌA & ĐỊNH VỊ BẢN THÂN
* **Thời lượng**: 30 giây
* **Nói ý gì**: Chào hỏi, giới thiệu bản thân và nêu ngắn gọn bài toán hôm nay.
* **Lời thoại**:
  > *"Em xin chào các anh chị trong Hội đồng đánh giá Nexlab Technology.  
  > Em là **Đặng Anh Tường**, sinh viên năm cuối Khoa Công nghệ Thông tin — Đại học Thủy Lợi (Cơ sở 2 TP.HCM).  
  > 
  > Hôm nay, em xin trình bày đề xuất giải pháp: **'Kiến trúc tài liệu Spec-Driven Development: Từ Vibe-Coding đến Git-Native Spec Engine cho đội ngũ kỹ sư Nexlab'**.  
  > 
  > Bài thuyết trình này được đúc kết từ 3 ngày thực nghiệm độc lập của em: từ việc trực tiếp test công cụ AI Grapuco ở Day 1, phỏng vấn thực tế một Senior Mentor để viết bộ PRD hoàn chỉnh ở Day 2, cho đến việc đề xuất một kiến trúc tinh gọn, 0 đồng chi phí mà em bảo vệ ngày hôm nay."*

---

### 🎙️ SLIDE 2: BỐI CẢNH 2026 & TẠI SAO CẦN SDD?
* **Thời lượng**: 40 giây
* **Nói ý gì**: Dùng AI không có phương pháp thì giống thợ xây không có bản vẽ.
* **Lời thoại**:
  > *"Năm 2026, lập trình cùng AI như Cursor hay Claude Code đã thành thói quen hàng ngày. Nhưng nếu không có phương pháp, chúng ta rất dễ mắc phải 3 cái bẫy lớn:  
  > 
  > Một là **Căn bệnh 'Vibe-Coding'**: Tức là ta cứ chat bừa bãi vài câu mơ hồ với AI. AI tự đoán ý, sinh code chạy được lúc đầu nhưng càng về sau càng sai lệch bài toán. Nó giống như thợ xây nhà mà không có bản vẽ, cứ xây đại rồi vừa làm vừa sửa.  
  > 
  > Hai là **Vỡ kiến trúc**: AI chỉ nhìn thấy một đoạn code nhỏ. Sửa được tính năng này thì vô tình làm hỏng tính năng khác mà dev không biết.  
  > 
  > Ba là **Chi phí sửa lỗi muộn**: Một lỗi logic phát hiện khi đã viết code hoặc deploy tốn thời gian sửa chữa gấp 10 lần so với việc ta làm rõ yêu cầu ngay từ đầu.  
  > 
  > Đó là lý do Nexlab cần chuẩn hóa **Spec-Driven Development** — Lập trình dựa trên bản đặc tả kỹ thuật."*

---

### 🎙️ SLIDE 3: SDD LÀ GÌ? SO SÁNH VỚI TDD & BDD
* **Thời lượng**: 40 giây
* **Nói ý gì**: SDD là bước tiến hóa trong kỷ nguyên AI. Người làm thiết kế, AI làm thợ gõ code.
* **Lời thoại**:
  > *"Trước đây, chúng ta quen với **TDD** hay **BDD** — tức là viết test trước rồi con người tự gõ code sau. Điểm yếu là dev vẫn có thể viết code chạy qua 100% test nhưng sản phẩm làm ra vẫn không đúng nhu cầu của khách hàng.  
  > 
  > Còn với **Spec-Driven Development (SDD)**:  
  > Bản đặc tả (Spec) được coi là **'Nguồn sự thật duy nhất' (Single Source of Truth)**.  
  > 
  > Điểm mấu chốt nhất của SDD là phân định rõ vai trò:  
  > **Con người** tập trung 100% vào việc khó nhất: tìm đúng bài toán, thiết kế kiến trúc và viết tiêu chí nghiệm thu rõ ràng.  
  > Còn **AI** đóng vai trò là 'đôi tay thực thi': nhận spec để tự động viết code và tự động viết test để kiểm tra lại chính nó."*

---

### 🎙️ SLIDE 4: THỰC TRẠNG QUẢN LÝ TÀI LIỆU TẠI NEXLAB
* **Thời lượng**: 40 giây
* **Nói ý gì**: Chỉ ra 3 nút thắt: Lệch pha spec-code, tràn ngữ cảnh AI, và quy trình bị cồng kềnh.
* **Lời thoại**:
  > *"Nhìn vào thực tế vận hành tài liệu tại Nexlab, em nhận thấy 3 điểm nghẽn rất rõ ràng:  
  > 
  > Thứ nhất là **Lệch pha (Spec Drift)**: Tài liệu thì nằm trên Notion, còn code thì nằm trên GitHub. Code sửa liên tục theo sprint, nhưng chẳng ai rảnh để quay lại cập nhật Notion. Sau 1 tháng, spec biến thành 'tài liệu chết'.  
  > 
  > Thứ hai là **Tràn ngữ cảnh (Context Bloat)**: Khi muốn AI code, dev copy nguyên file tài liệu dày cộp ném vào chat. AI bị quá tải bộ nhớ, tốn tiền token mà lại dễ sinh ra ảo giác kỹ thuật.  
  > 
  > Thứ ba là **Gánh nặng quy trình**: Playbook v2 bắt tính năng lớn hay nhỏ đều phải viết đủ 8 mục dài dòng. Task nhỏ làm có 1 ngày mà bắt viết dài thì dev sẽ làm đối phó hoặc bỏ qua luôn."*

---

### 🎙️ SLIDE 5: CASE STUDY GRAPUCO — 3 ĐIỂM MẠNH
* **Thời lượng**: 35 giây
* **Nói ý gì**: Em đã trực tiếp test Grapuco độc lập bằng email cá nhân, ghi nhận 3 điểm mạnh về công nghệ AST.
* **Lời thoại**:
  > *"Ở Day 1, em đã trực tiếp đăng ký tài khoản trial bằng email `danganhtuongg@gmail.com` để test thực tế công cụ AI Grapuco trên kho code `nexlab-intern-api`.  
  > 
  > Em nhận thấy Grapuco có **3 điểm mạnh công nghệ đáng chú ý**:  
  > 1. Nó tự động quét cây cú pháp (AST) của code rất nhanh, dựng được sơ đồ quan hệ giữa các hàm và module.  
  > 2. Giúp trực quan hóa luồng dữ liệu của hệ thống.  
  > 3. Tự động gợi ý các trường thông tin cơ bản để dev viết PRD nhanh hơn.  
  > 
  > Tuy nhiên, khi đi sâu vào vận hành thực tế thì lại bộc lộ những rào cản chí mạng."*

---

### 🎙️ SLIDE 6: CASE STUDY GRAPUCO — 3 ĐIỂM YẾU CHÍ MẠNG
* **Thời lượng**: 45 giây
* **Nói ý gì**: Chỉ ra bằng chứng thực tế: Rời rạc, ngốn credit nhanh (200 -> 184 sau 2 câu), và khóa chặt vào vendor.
* **Lời thoại**:
  > *"Qua thực nghiệm, em phát hiện **3 điểm yếu chí mạng của Grapuco**:  
  > 
  > Một là **Quy trình bị rời rạc**: Quản lý code một nơi, viết spec một nẻo. Muốn gắn chúng lại với nhau, dev phải tạo thêm một 'Workspace' thứ 3 rồi gắp thủ công, rất mất thời gian.  
  > 
  > Hai là **Ngốn credit cực nhanh và giới hạn 50MB**: Như ảnh chụp thực tế của em: tài khoản vừa có 200 credits, chỉ chat đúng 2 câu đã tụt xuống còn 184 credits! Một dự án thật dùng cả ngày sẽ ngốn ngân sách rất lớn. Đã vậy, nó còn giới hạn repo dưới 50MB — không thể áp dụng cho dự án thật.  
  > 
  > Ba là **Bị khóa chặt (Vendor Lock-in) và không gắn với Git**: Toàn bộ spec nằm trên đám mây của Grapuco. Ta không thể review qua Git Pull Request, không so sánh được `git diff`, và nếu họ tăng giá hay sập server thì công ty bị phụ thuộc hoàn toàn."*

---

### 🎙️ SLIDE 7: MOCK PROJECT DEMO — PHÂN TÍCH BÀI TOÁN
* **Thời lượng**: 45 giây
* **Nói ý gì**: Dẫn chứng phỏng vấn người thật 38 phút với Senior Mentor theo The Mom Test, đưa ra số liệu nhức nhối (8h/tuần, 30% kẹt bài).
* **Lời thoại**:
  > *"Sang Day 2, em không ngồi tự tưởng tượng tính năng mà trực tiếp thực hiện bài toán **NexTrack — Quản lý tiến độ Intern**.  
  > 
  > Em đã phỏng vấn 38 phút với anh **Lê Trí Thiện — Senior Mentor** đang quản lý các bạn thực tập sinh, áp dụng đúng phương pháp **The Mom Test**: không hỏi ý kiến tương lai, chỉ hỏi hành vi và số liệu thực tế trong quá khứ.  
  > 
  > Kết quả chỉ ra 3 con số nhức nhối:  
  > • **8 tiếng mỗi tuần**: Thời gian mentor bị lãng phí chỉ để đi lùng sục link bài tập bị trôi trên Slack rồi copy thủ công vào Google Sheets.  
  > • **30% số bài nộp**: Bị kẹt tiến độ 1-2 ngày do học viên không biết bài mình có cần sửa hay không.  
  > • **Quy mô 6 intern/mentor**: Bắt đầu làm file Excel quá tải và việc đánh giá cuối kỳ bị phụ thuộc vào cảm tính.  
  > 
  > **Gốc rễ vấn đề**: Là do dữ liệu bị xé lẻ giữa Slack và Excel, thiếu một hàng đợi nộp bài tập trung."*

---

### 🎙️ SLIDE 8: CHUẨN HÓA ACCEPTANCE CRITERIA 3 VẾ
* **Thời lượng**: 40 giây
* **Nói ý gì**: Mẫu AC 3 vế (Ai làm gì -> Hành động gì -> Kết quả đo được là gì) giúp AI code chuẩn 100%.
* **Lời thoại**:
  > *"Từ nỗi đau đó, trong file `PRD_v1.md`, em đã chuẩn hóa toàn bộ yêu cầu thành công thức **Acceptance Criteria 3 vế: WHO -> ACTION -> RESULT**.  
  > 
  > Ví dụ ở tính năng **Nộp bài**:  
  > • **WHO**: Intern đã đăng nhập.  
  > • **ACTION**: Chọn bài Day 02, dán link hợp lệ, nhập ít nhất 20 ký tự ghi chú, bấm [Nộp bài].  
  > • **RESULT**: Hệ thống báo thành công trong dưới 500 mili-giây, đổi trạng thái sang 'Chờ chấm' và đưa ngay vào danh sách chờ của Mentor.  
  > 
  > Khi viết rõ ràng 3 vế như thế này:  
  > Dev đọc vào là hiểu ngay, còn AI Coding Agent sẽ biết chính xác cần phải viết validation gì và tự sinh đúng bộ Unit Test để kiểm chứng."*

---

### 🎙️ SLIDE 9: KIẾN TRÚC ĐỀ XUẤT NEXSPEC HYBRID
* **Thời lượng**: 45 giây
* **Nói ý gì**: 3 tầng kiến trúc: Git lưu trữ 0đ, Local MCP đưa đúng thông tin cho AI, và Quy trình PRD phân tầng.
* **Lời thoại**:
  > *"Để giải quyết triệt để các vấn đề trên, em đề xuất giải pháp: **NexSpec Hybrid — Kiến trúc quản lý spec gắn liền với Git**, gồm 3 tầng đơn giản:  
  > 
  > **Tầng 1 — Git-Native Storage (Lưu trữ gắn liền với Code)**:  
  > Toàn bộ spec được viết bằng file Markdown, lưu ngay trong thư mục `/docs/` của Git. Code đi đâu, spec đi đó. Xem lại lịch sử bằng `git log`, review duyệt spec bằng Pull Request trên GitHub. Chi phí: **0 đồng!**  
  > 
  > **Tầng 2 — Local MCP Server (Người thủ thư an toàn)**:  
  > Chạy một tiến trình MCP Server siêu nhẹ ngay trên máy dev. Giống như một người thủ thư: khi Cursor hay Claude Code cần ngữ cảnh, MCP chỉ trích xuất đúng đoạn tiêu chí AC liên quan để đưa cho AI. Vừa tiết kiệm token, vừa bảo mật 100% mã nguồn nội bộ.  
  > 
  > **Tầng 3 — Tiered-PRD (Phân tầng linh hoạt)**:  
  > Bỏ cơ chế cứng nhắc: Task nhỏ 1-2 ngày chỉ cần viết **Lite PRD** gọn gàng trong 1 trang; chỉ module lớn của công ty mới cần viết **Full PRD** 8 mục."*

---

### 🎙️ SLIDE 10: QUY TRÌNH 4 BƯỚC ĐƯA SPEC VÀO CODE & TOOL STACK
* **Thời lượng**: 40 giây
* **Nói ý gì**: 4 bước quen thuộc: Viết Draft -> Peer Review PR -> Merge SOT -> AI nhận spec sinh code. Tool 0 đồng.
* **Lời thoại**:
  > *"Quy trình làm việc hàng ngày của kỹ sư sẽ diễn ra tự nhiên qua 4 bước:  
  > • **Bước 1**: Kỹ sư viết bản nháp Markdown vào thư mục `/docs/`.  
  > • **Bước 2**: Tạo Pull Request để đồng nghiệp và Tech Lead review, phản biện spec trước khi gõ code.  
  > • **Bước 3**: Merge vào nhánh chính, chính thức khóa phiên bản chuẩn.  
  > • **Bước 4**: Mở Cursor IDE. Local MCP tự động đưa tiêu chí AC vào cho AI sinh code và sinh test.  
  > 
  > Toàn bộ bộ công cụ này cực kỳ tinh gọn: Dùng Git và Markdown sẵn có; Local MCP Server tự viết bằng Node.js chưa tới 300 dòng code; và dùng GitHub Actions tự động kiểm tra định dạng AC trước khi cho phép merge."*

---

### 🎙️ SLIDE 11: SO SÁNH TRADE-OFF SÒNG PHẲNG
* **Thời lượng**: 35 giây
* **Nói ý gì**: Không có giải pháp hoàn hảo, chỉ có giải pháp phù hợp: Đổi một chút kỷ luật để lấy an toàn và 0đ chi phí.
* **Lời thoại**:
  > *"Đặt lên bàn cân so sánh sòng phẳng:  
  > 
  > **Grapuco Cloud**: Quét AST thông minh nhưng đắt đỏ theo credit, giới hạn 50MB và nguy cơ lộ code nội bộ.  
  > **Pure Notion**: Viết đẹp nhưng tách rời khỏi code, không có Git version control và phải copy thủ công.  
  > 
  > **NexSpec Hybrid**:  
  > • Lợi ích vượt trội: **Chi phí 0 đồng**, chạy offline, an toàn dữ liệu tuyệt đối và spec luôn đi cùng code.  
  > • **Đánh đổi duy nhất**: Kỹ sư cần giữ kỷ luật viết Markdown theo mẫu và mất 15 phút cài Local MCP lúc đầu. Em tin đây là sự đánh đổi hoàn toàn xứng đáng cho Nexlab."*

---

### 🎙️ SLIDE 12: LỘ TRÌNH TRIỂN KHAI 30-60-90 DAYS
* **Thời lượng**: 40 giây
* **Nói ý gì**: Kế hoạch thực tế: 30 ngày làm móng -> 60 ngày thí điểm 2 dự án -> 90 ngày mở rộng, tiết kiệm 150-200h/quý.
* **Lời thoại**:
  > *"Lộ trình triển khai thực tế gồm 3 giai đoạn rõ ràng:  
  > 
  > **30 Ngày đầu — Nền móng & Mẫu chuẩn**: Thiết lập template `/docs/` mẫu, ban hành quy chế Tiered-PRD và đóng gói Local MCP Server. Mục tiêu: 0 đồng chi phí mua tool ngoài.  
  > 
  > **60 Ngày tiếp theo — Thí điểm 2 dự án**: Áp dụng thử nghiệm trên 2 dự án mới tại Nexlab, gắn GitHub Action kiểm tra format AC tự động. Mục tiêu: Giảm 50% thời gian review và không còn bug do hiểu sai yêu cầu.  
  > 
  > **90 Ngày — Mở rộng toàn diện**: Triển khai ra toàn bộ engineering teams, tổ chức workshop chia sẻ.  
  > Mục tiêu định lượng: Giảm 60% thời gian onboarding nhân sự mới, và ước tính **tiết kiệm từ 150 đến 200 giờ công mỗi quý** cho toàn công ty."*

---

### 🎙️ SLIDE 13: BÀI HỌC KINH NGHIỆM & VAI TRÒ KỸ SƯ AI
* **Thời lượng**: 40 giây
* **Nói ý gì**: 3 đúc kết thực chiến và sự chuyển dịch từ thợ gõ code sang kiến trúc sư hệ thống.
* **Lời thoại**:
  > *"Sau 3 ngày thực chiến với đề bài của Nexlab, em đúc rút được 3 bài học lớn:  
  > 
  > Một là: **Tìm đúng bài toán quyết định 80% thành bại**. Một buổi phỏng vấn 38 phút với người thật giá trị hơn hàng tuần ngồi tự suy đoán.  
  > Hai là: **AI chỉ sắc bén khi Spec đủ chuẩn**. AC 3 vế chính là ngôn ngữ lập trình cấp cao nhất để ta chỉ huy AI.  
  > Ba là: **Không sùng bái công cụ**. Dùng thông minh những thứ sẵn có như Git và MCP còn hiệu quả và an toàn hơn mua tool đắt đỏ.  
  > 
  > Điều này định hình lại vai trò của chúng ta trong năm 2026:  
  > Kỹ sư phần mềm không còn là 'thợ gõ code' nữa, mà đã trở thành **Kiến trúc sư hệ thống và Người gác cổng chất lượng**: Làm chủ bài toán, thiết kế ranh giới và kiểm soát chặt chẽ những gì AI tạo ra."*

---

### 🎙️ SLIDE 14: KẾT LUẬN & MỜI TRAO ĐỔI Q&A
* **Thời lượng**: 20 giây
* **Nói ý gì**: Chốt lại thông điệp đắt giá và mở phiên Q&A với thái độ tự tin, cầu thị.
* **Lời thoại**:
  > *"Em xin khép lại bài thuyết trình bằng một thông điệp:  
  > **'Làm chủ công nghệ từ bản đặc tả con người — AI chỉ thực sự mạnh mẽ khi bản thiết kế của kỹ sư đủ sắc sảo.'**  
  > 
  > Em xin chân thành cảm ơn các anh chị đã chú ý lắng nghe. Em rất sẵn sàng đón nhận các câu hỏi và góp ý từ anh chị ạ!"*

---

## 🛡️ BỘ TRẢ LỜI PHẢN BIỆN Q&A (NGẮN GỌN & THẲNG VÀO TRỌNG TÂM)

Khi Ban giám khảo hỏi, hãy trả lời theo cấu trúc: **Đi thẳng vào câu trả lời -> Đưa ra 2-3 ý gạch đầu dòng -> Chốt lại bằng lợi ích thực tế.**

---

### ❓ Câu 1: "Tại sao không dùng luôn Notion có sẵn của công ty kết hợp với Notion MCP?"
* **Trả lời ngắn gọn (45 giây)**:
  > *"Dạ, Notion rất tuyệt vời để con người trao đổi ý tưởng. Nhưng nếu dùng Notion làm nguồn dữ liệu cho AI code thì bị vướng 3 điểm kỹ thuật:  
  > 1. **Notion không có nhánh (Branching) như Git**: Khi code tạo nhánh mới, Notion không thể rẽ nhánh theo. Ai đó sửa spec trên Notion cho tính năng mới thì nhánh code cũ đang chạy production sẽ bị sai lệch ngay.  
  > 2. **Độ trễ và giới hạn API**: Notion MCP phải gọi qua cloud ở nước ngoài, dễ bị nghẽn mạng hoặc chạm trần rate-limit.  
  > 3. Trong khi đó, file Markdown nằm thẳng trong Git repo: code rẽ nhánh nào thì spec đi theo nhánh đó, xem được `git diff` từng dòng, và Local MCP đọc trực tiếp từ ổ cứng mất chưa tới 2 mili-giây với chi phí 0 đồng ạ."*

---

### ❓ Câu 2: "Viết spec bằng Markdown trong Git thì BA hay Designer làm sao review được?"
* **Trả lời ngắn gọn (30 giây)**:
  > *"Dạ, em đề xuất phối hợp 2 giai đoạn rất linh hoạt:  
  > • Lúc đầu brainstorming, BA và Designer cứ thảo luận thoải mái trên Notion hoặc Figma.  
  > • Khi chốt xong để chuẩn bị code, ta xuất bản spec thành file Markdown trong Git và tạo Pull Request.  
  > Giao diện GitHub hiện nay hiển thị Markdown rất đẹp như một trang web, các bạn BA/PO hoàn toàn có thể bôi đen từng dòng và gõ comment review giống hệt như trên Google Docs, rất dễ dùng ạ."*

---

### ❓ Câu 3: "Local MCP Server tự viết có phức tạp không và mất bao lâu để làm?"
* **Trả lời ngắn gọn (30 giây)**:
  > *"Dạ, hoàn toàn không phức tạp ạ.  
  > Bản chất nó chỉ là một đoạn code Node.js ngắn dưới 300 dòng, dùng thư viện chính thức của Anthropic. Nó chạy offline qua cổng stdio của máy dev chứ không mở cổng mạng ra ngoài.  
  > Nó chỉ làm đúng 2 việc: AI cần đoạn spec nào thì đọc file Markdown đưa đoạn đó, và bóc tách đúng tiêu chí AC 3 vế. Em tự tin có thể lập trình xong và viết tài liệu hướng dẫn cho cả team chỉ trong 1 đến 2 ngày làm việc ạ."*

---

### ❓ Câu 4: "Làm sao đảm bảo dev chịu viết spec thay vì nhảy vào gõ code luôn?"
* **Trả lời ngắn gọn (35 giây)**:
  > *"Dạ, để anh em dev tự giác làm theo, em dựa vào 2 yếu tố:  
  > 1. **Dễ làm**: Task nhỏ em chỉ yêu cầu viết bản Lite PRD 1 trang tốn 10 phút, không bắt viết 8 mục cồng kềnh.  
  > 2. **Thấy rõ lợi ích**: Khi dev thấy bỏ 10 phút viết tiêu chí AC chuẩn mà AI sinh ra code đúng ngay lần đầu, không phải thức đêm mò bug, họ sẽ chủ động viết vì nó giúp chính họ nhàn hơn.  
  > Ngoài ra, ta gắn thêm một GitHub Action nhỏ: PR nào sửa code mà không có file spec đi kèm thì chặn nút merge là sẽ vào nề nếp ngay ạ."*

---

### ❓ Câu 5: "Nếu có hotfix sửa code gấp mà quên sửa spec thì hệ thống phát hiện thế nào?"
* **Trả lời ngắn gọn (30 giây)**:
  > *"Dạ, có 2 tầng xử lý rất nhanh:  
  > Tầng 1: Bot CI trên GitHub sẽ quét: nếu thấy sửa file logic mà thư mục `/docs/` không đổi thì bot tự động gắn cờ cảnh báo `[Missing-Spec]`.  
  > Tầng 2: Sau khi fix xong, dev chỉ cần chạy 1 câu lệnh: AI sẽ đọc `git diff` của đoạn code vừa sửa để tự sinh ngược lại đoạn mô tả cho spec. Dev chỉ việc duyệt lại và commit là xong ạ."*

---

### ❓ Câu 6: "Tại sao em lại dùng The Mom Test để phỏng vấn thay vì hỏi thẳng họ muốn gì?"
* **Trả lời ngắn gọn (30 giây)**:
  > *"Dạ, vì theo tâm lý học của sách The Mom Test: Nếu mình hỏi 'Anh có thích tính năng X không?', người ta sẽ luôn lịch sự trả lời 'Có, thích lắm' nhưng làm ra thì không ai dùng.  
  > Vì vậy, em chỉ hỏi về **những gì đã thực sự xảy ra trong quá khứ**: Tuần trước anh chấm bài thế nào, lần gần nhất bị kẹt bài mất mấy ngày. Nhờ hỏi sự thật quá khứ, em mới phát hiện ra mentor mất tới 8 tiếng/tuần vì link trôi trên Slack, từ đó thiết kế đúng tính năng giải quyết đúng nỗi đau của họ ạ."*

---

### ❓ Câu 7: "Làm sao em tính ra được con số tiết kiệm 150-200 giờ công mỗi quý?"
* **Trả lời ngắn gọn (35 giây)**:
  > *"Dạ, con số này xuất phát trực tiếp từ số liệu phỏng vấn Day 2:  
  > Hiện tại 1 mentor mất 8 tiếng/tuần để đi gom link và chấm bài thủ công. Có hệ thống tập trung, con số này giảm xuống còn 2 tiếng -> Tiết kiệm **6 tiếng/tuần**.  
  > Một quý 12 tuần: `6 tiếng x 12 tuần = 72 giờ công cho 1 mentor`.  
  > Nexlab chỉ cần có 2 đến 3 mentor hoặc tech lead kiêm nhiệm là ta đã tiết kiệm được **khoảng 180 giờ công mỗi quý**. Con số này hoàn toàn thực tế và có thể đo lường được ngay ạ."*
