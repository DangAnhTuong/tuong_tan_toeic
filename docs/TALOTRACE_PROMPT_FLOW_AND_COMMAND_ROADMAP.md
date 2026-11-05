# 🎙️ LỘ TRÌNH RA LỆNH CHO AI THEO ĐÚNG PHONG CÁCH TỰ NHIÊN CỦA ANH TƯỜNG
## TALOTRACE TAKE-HOME CHALLENGE: FULL STACK ENGINEER - INTERNAL SYSTEMS
> **Tác giả:** Đặng Anh Tường (`danganhtuongg@gmail.com` • `0335847674` • Bình Thạnh, TP.HCM)  
> **Đặc trưng:** Câu lệnh ngắn gọn, tự nhiên, chuẩn phong thái Tech Lead chỉ huy AI (Đọc kỹ đề ➔ Lên kế hoạch ➔ Duyệt từng giai đoạn ➔ Rà soát lỗi & điều cấm kỵ ➔ Hoàn thiện chuẩn doanh nghiệp ➔ Chạy test ➔ Demo).

---

## 📌 PHẦN 1: CÁC THIẾT LẬP VÀNG TRƯỚC KHI BẤM NÚT RECORD (ZOOM)

1. **Cài đặt IDE:**
   - `Auto Execution:` Để `Always Proceed` *(để AI tự chạy lệnh terminal và tạo file nhanh gọn)*.
   - `Review Policy:` Để `Always Proceed` *(để không bị pop-up hỏi liên tục, anh chỉ cần quan sát mã trên màn hình và nhận xét bằng giọng nói trước camera)*.
2. **Khởi động Zoom:**
   - Bật Zoom -> `New Meeting` -> Bật Camera -> `Share Screen` -> **BẮT BUỘC CHỌN `Screen 1` (Toàn bộ màn hình)**.
   - Bấm `Record on this Computer` *(hoặc phím tắt `Alt + R`)* để bắt đầu tính giờ.

---

## 🧭 PHẦN 2: 6 CÂU LỆNH NGẮN GỌN & TỰ NHIÊN RA LỆNH CHO AI

---

### 🗣️ BƯỚC 1: ĐỌC ĐỀ & LÊN KẾ HOẠCH (00:00 - 10:00)

> **Anh Tường nói mở đầu trước camera:**  
> *"Xin chào ban tuyển dụng TaloTrace, mình là Đặng Anh Tường. Hôm nay mình sẽ tiến hành giải quyết bài thử thách Take-Home Challenge cho vị trí Full Stack Engineer - Internal Systems cùng sự hỗ trợ của AI Coding Agent."*

> **Anh Tường ra lệnh cho AI (Nói mic hoặc paste câu ngắn sau):**  
> *"Bạn hãy đọc thật kỹ file PDF đề bài và toàn bộ dữ liệu mẫu trong thư mục `A:\interview`. Lưu ý phân tích thật kỹ các yêu cầu bắt buộc, các điều cấm kỵ (red flags), triết lý cốt lõi 'The system suggests. HR decides', rồi lên cho tôi một bản kế hoạch kiến trúc chi tiết từng giai đoạn nhé."*

- **Anh Tường nhận xét trước camera khi AI trả lời xong:**  
  *"Kế hoạch kiến trúc từng giai đoạn AI đưa ra rất hợp lý và đã bao quát đầy đủ yêu cầu đề bài. Bây giờ chúng ta sẽ bắt đầu triển khai Giai đoạn 1."*

---

### 🗣️ BƯỚC 2: DUYỆT & LÀM GIAI ĐOẠN 1 - DATABASE & DATA PACK (10:00 - 35:00)

> **Anh Tường ra lệnh cho AI:**  
> *"Tôi thấy kế hoạch rất hợp lý. Bây giờ bạn bắt đầu triển khai Giai đoạn 1: thiết kế cơ sở dữ liệu SQLite bền vững (không dùng RAM) và viết script nạp toàn bộ dữ liệu từ thư mục `A:\interview\business-systems-pack` vào database nhé."*

- **Hành động sau khi AI làm xong:**  
  - Thấy terminal in ra nạp thành công 5 roles, 6 questions, 18 candidates.
  - Anh Tường nhận xét trước camera: *"Database SQLite đã được khởi tạo và nạp đủ dữ liệu mẫu. Mã nguồn rất gọn gàng. Hãy tạo git commit cho giai đoạn này."*
  - AI chạy commit: `git add . && git commit -m "feat(db): initialize sqlite schema and seed authentic data pack"`

---

### 🗣️ BƯỚC 3: SANG GIAI ĐOẠN 2 - BACKEND FASTAPI & AI SCORER (35:00 - 70:00)

> **Anh Tường ra lệnh cho AI:**  
> *"Giai đoạn 1 làm rất tốt. Bây giờ tiếp tục triển khai Giai đoạn 2: xây dựng Backend FastAPI và Động cơ chấm điểm AI Scorer nhé."*

- **Hành động sau khi AI làm xong:**  
  - Backend đã sẵn sàng với các API ứng viên, API HR và AI scorer.
  - Anh Tường nhận xét trước camera: *"Backend API và AI Scorer đã hoàn tất. Tiến hành commit giai đoạn 2."*
  - AI chạy commit: `git add . && git commit -m "feat(api): build fastapi endpoints, background scorer and security rules"`

---

### 🗣️ BƯỚC 4: SANG GIAI ĐOẠN 3 - GIAO DIỆN NEXT.JS (70:00 - 100:00)

> **Anh Tường ra lệnh cho AI:**  
> *"Backend chạy ổn rồi. Bây giờ bạn triển khai tiếp Giai đoạn 3: xây dựng giao diện người dùng Next.js cho cả Cổng Ứng viên và Cổng Quản trị HR nhé."*

- **Hành động sau khi AI làm xong:**  
  - Frontend hiển thị Stepper 6 câu hỏi cho ứng viên và Dashboard HR.
  - Anh Tường nhận xét trước camera: *"Giao diện người dùng đã hoàn thành đồng bộ với backend. Hãy tạo git commit cho giai đoạn 3."*
  - AI chạy commit: `git add . && git commit -m "feat(ui): implement candidate portal and hr evaluation dashboard"`

---

### 🗣️ BƯỚC 5: CÂU LỆNH TỔNG KIỂM TRA & RÀ SOÁT ĐIỀU CẤM KỴ (100:00 - 115:00)
*(Đây chính là câu lệnh 'chốt hạ' thể hiện bản lĩnh của anh Tường: yêu cầu AI tự soi lỗi, tự quét điều cấm kỵ và hoàn thiện chuẩn doanh nghiệp)*

> **Anh Tường ra lệnh cho AI:**  
> *"Bây giờ bạn hãy kiểm tra lại toàn bộ dự án từ đầu đến cuối: xem có lỗi gì không, tất cả những thứ đề bài bắt buộc đã làm đủ chưa, và đặc biệt rà soát kỹ xem có dính bất kỳ điều cấm kỵ (red flags) nào của nhà tuyển dụng không. Với những phần đề bài chưa đề cập tới, hãy tự đề xuất và hoàn thiện theo đúng luồng chuẩn doanh nghiệp thực tế nhé."*

- **Lợi ích của câu lệnh này:**  
  *(AI sẽ tự động kiểm tra lại 13 lỗi cấm kỵ: Zero-leakage rubric, chặn 403 API HR, chống duplicate score khi ấn nút 2 lần, bắt buộc lý do khi HR đổi điểm, trung hòa prompt injection, phân lập lỗi mạng thành 'failed' với điểm None, và gắn nhãn đăng nhập giả lập. Đồng thời AI sẽ hoàn thiện các tính năng nâng cao chuẩn doanh nghiệp như nút Thử lại Retry không giật cuộn trang, F5 resume tiến độ làm bài, và báo nhận bài tức thì)*.
- Anh Tường nhận xét trước camera: *"Hệ thống đã được rà soát kỹ lưỡng và đáp ứng 100% mọi tiêu chuẩn khắt khe của doanh nghiệp. Hãy tạo commit hoàn thiện."*
- AI chạy commit: `git add . && git commit -m "refactor(audit): ensure full compliance with business standards and zero red flags"`

---

### 🗣️ BƯỚC 6: CHẠY BỘ KIỂM THỬ TỰ ĐỘNG (115:00 - 120:00)

> **Anh Tường ra lệnh cho AI:**  
> *"Rất tuyệt vời. Bây giờ hãy chạy toàn bộ các bài test kiểm thử tự động để xác nhận hệ thống hoạt động hoàn hảo 100% nhé."*

- **Hành động sau khi AI chạy:**  
  - Terminal chạy Pytest và script kiểm tra độc lập: `10/10 Tests Passed`, `13/13 Checks Passed`.
  - Anh Tường nhận xét: *"Toàn bộ các bài test đều vượt qua 100%. Bây giờ em sẽ chuyển sang phần thuyết trình demo trực tiếp trên web."*

---

## 🎬 PHẦN 3: KỊCH BẢN DEMO WEB TRỰC TIẾP (5 PHÚT CUỐI VIDEO)
*(Mở Google Chrome lên thao tác trực tiếp)*

1. **Demo Cổng Ứng viên (`http://localhost:3000/candidate/cand_token_c2041_0925c15c4780`):**
   - Chỉ vào Stepper: *"Cổng ứng viên mở qua token cá nhân, hiển thị từng câu hỏi một trong 6 câu, tuyệt đối không lộ barem rubric hay điểm số."*
   - Gõ chữ vào Câu 1 rồi bấm Lưu: *"Hệ thống hiển thị thông báo đã nhận bài tức thì (Instant Receipt)."*
   - Bấm F5 trên bàn phím: *"Khi F5 reload lại trang, hệ thống tự động đưa về đúng Câu 1 và giữ nguyên câu trả lời vừa gõ."*
   - Mở Câu 6 (Audio): *"Ứng viên có thể ghi âm trực tiếp qua micro hoặc tải file audio. Hệ thống tự động gán trạng thái `needs_a_person` để HR nghe duyệt."*

2. **Demo Cổng Quản Trị HR (`http://localhost:3000/hr`):**
   - Chỉ vào nhãn đăng nhập: *"Cổng HR có gắn nhãn rõ ràng `[MOCKED SIGN-IN • EVALUATION ONLY]` theo đúng quy định."*
   - Bấm vào bảng điều khiển: *"HR có thể lọc theo 5 vị trí, xem 18 ứng viên với thanh điểm trực quan (điểm >= 3.0 đạt chuẩn)."*
   - Bấm vào ứng viên `C2041`: *"Màn hình chi tiết hiển thị câu trả lời đặt cạnh tiêu chí Rubric, điểm số AI gợi ý kèm lời giải thích."*
   - Bấm nút **Ghi đè điểm (Override)**: *"Nếu để trống lý do, hệ thống khóa nút Lưu. Khi nhập lý do và bấm Lưu, điểm số được cập nhật kèm lịch sử kiểm toán minh bạch."*
   - Chỉ vào nút **Thử lại (Retry)**: *"Khi có job lỗi mạng, HR có thể bấm Thử lại để chạy lại tác vụ ngầm mà không làm giật màn hình."*

3. **Chào kết thúc video:**  
   - *"Hệ thống đã hoạt động trơn tru từ đầu đến cuối, đáp ứng chính xác triết lý 'The system suggests. HR decides'. Em xin cảm ơn ban tuyển dụng TaloTrace đã theo dõi phiên làm việc của em!"*  
   - Bấm **Stop Recording** trên Zoom *(hoặc `Alt + R`)* -> **End Meeting for All**.

---

## 📬 PHẦN 4: NỘP BÀI (SAU KHI TẮT ZOOM)
1. Đẩy code lên GitHub Private: `git push origin main`.
2. Mời Collaborators: `praveen.k@growtrics.ai` và `wayne.le@growtrics.ai`.
3. Tải video Zoom lên Google Drive, share quyền Viewer cho: `hr-submissions@talotrace.ai`.
4. Mở link: `https://apply.talotrace.ai/i/full-stack-engineer-internal-systems/0eqAQD9tAw` trả lời 3-5 câu hỏi video (15 phút).
5. Reply email `careers@talotrace.ai` gửi 2 đường link hoàn tất.
