# 📊 BÁO CÁO THẨM ĐỊNH NGUỒN GỐC, QUY TRÌNH THU THẬP & XỬ LÝ DỮ LIỆU
## HỆ THỐNG LUYỆN HỌC VÀ THI THỬ TOEIC — TƯỜNG TẬN TOEIC

*Người thực hiện:* **Đặng Anh Tường** — Sinh viên chuyên ngành CNTT, Trường Đại học Thủy Lợi (Cơ sở 2 - TP.HCM)  
*Mục đích:* Tài liệu giải trình kỹ thuật và phụ lục minh chứng nguồn dữ liệu phục vụ Đề tài Chuyên đề CNTT.

---

## 1. Nguồn Gốc Dữ Liệu Gốc (Ground Truth Source)
Toàn bộ học liệu học tập và thi thử trong hệ thống đều xuất phát từ **Bộ đề thi chính thống của Viện Khảo thí Giáo dục Hoa Kỳ (ETS - Educational Testing Service)** — cơ quan duy nhất trên thế giới có thẩm quyền biên soạn đề thi TOEIC quốc tế.

* **Bộ đề khảo thí chuẩn hóa:** ETS TOEIC Regular Test các năm (ETS 2026, ETS 2024, ETS 2023, ETS 2022 - 2018).
* **Nền tảng tham chiếu học thuật tại Việt Nam:**
  * **Đậu TOEIC cũ (`dautoeic.com`) / Đậu English mới (`dauenglish.com`):** Nền tảng trực tuyến cung cấp định dạng bài tập phân loại theo cấp độ (Level 1 - Level 5) và từng phần thi (Part 1 - Part 7).
  * **Study4 (`https://study4.com/tests/toeic/`):** Nền tảng học liệu mở lưu trữ kho đề thi ETS công khai phổ biến nhất tại Việt Nam.
  * **Trang chủ ETS quốc tế:** `https://www.ets.org/toeic.html`.

---

## 2. Thống Kê Tổng Thể Dữ Liệu Trong Hệ Thống (Exact Database Audit)

Dữ liệu thực tế được lưu trữ và truy vấn trong hệ quản trị cơ sở dữ liệu MongoDB (`tuong_tan_toeic`):

| Phân hệ nghiệp vụ | Số lượng bản ghi / Câu hỏi | Chi tiết cấu trúc dữ liệu |
| :--- | :---: | :--- |
| **Đề thi thử Full 200 câu (Mock Tests)** | **10 bộ đề (2.000 câu hỏi ETS thật)** | Bộ đề ETS 2026 (Test 1 - Test 10), mỗi đề 200 câu hỏi gồm 100 câu Listening + 100 câu Reading, kèm Audio gốc, ảnh chụp, đáp án và lời giải chi tiết. |
| **Luyện nghe & Dictation (Listening)** | **31.015 câu hỏi / câu thoại** | Gồm 224 bài luyện tập: Part 1 (175 câu ảnh scan thật), Part 2 (hàng nghìn câu hỏi đáp), Part 3 & Part 4 (hàng chục nghìn lượt thoại độc lập phục vụ tính năng Nghe Chép Chính Tả). |
| **Luyện đọc & Ngữ pháp (Reading)** | **13.596 câu hỏi** | 76 bài tập lớn bao phủ Part 5 (2.430 câu), Part 6 (1.296 câu), Part 7 (4.438 câu), 14 chuyên đề ngữ pháp (997 câu) và 31 bài Đọc song ngữ Anh - Việt. |
| **Từ vựng Spaced Repetition (Vocab)** | **7.551 từ vựng (83 chủ đề)** | Bám sát 83 chủ đề kinh doanh/công sở chuẩn TOEIC, tích hợp phiên âm IPA, audio phát âm US/UK, ví dụ ngữ cảnh và giải thuật SuperMemo-2. |
| **Sổ tay câu sai (Mistakes Notebook)** | **295 câu mẫu ghi nhận** | Hệ thống Closed-Loop Learning tự động gom câu làm sai từ đề thi và bài tập về ôn lại. |

---

## 3. Vì Sao Không Thể Dùng Trực Tiếp Link Cloud Cũ Của Đậu TOEIC?
* **Thực trạng hệ thống cũ:** Nền tảng Đậu TOEIC trước đây từng lưu trữ media trên hạ tầng **Supabase Storage (`*.supabase.co`)**. Khi số lượng học viên tăng cao, Supabase gặp hiện tượng giới hạn băng thông (rate limit), dẫn đến link ảnh/audio bị lỗi 403 Forbidden hoặc hết hạn truy cập. Sau đó, Đậu TOEIC chuyển đổi hệ thống sang domain mới **Đậu English (`dauenglish.com`)**.
* **Giải pháp kỹ thuật của Đặng Anh Tường:**
  * Không sử dụng liên kết phụ thuộc vào bên thứ ba (tránh rủi ro "chết link" hoặc thay đổi tên miền).
  * Xây dựng **Data Pipeline** tải toàn bộ dữ liệu về máy chủ, tiến hành kiểm tra tính toàn vẹn (Checksum / Integrity check), đối chiếu với đề thi ETS gốc và **tự host 100% Media trên máy chủ VPS Linux (Nginx Web Server)**.

---

## 4. Quy Trình 4 Bước Xử Lý Dữ Liệu (Data Pipeline)
1. **Thu thập dữ liệu (Data Scraping & Extraction):** Dùng script Python/Node.js bóc tách câu hỏi, transcript, đáp án và lời giải từ học liệu mở.
2. **Làm sạch & Chuẩn hóa (Data Cleansing & Normalization):**
   * Lọc bỏ hoàn toàn các câu chỉ dẫn làm bài chung (`Directions:`, `Questions 32 through 34 refer to...`).
   * Chuẩn hóa chính xác 175 ảnh scan Part 1 và 55 ảnh bảng biểu Part 3/4.
   * Dịch nghĩa tiếng Việt cho 100% 4 phương án A-B-C-D.
3. **Cắt lát âm thanh đơn câu (Audio Slicing Engine):**
   * Tách các file audio gốc dài 45 phút thành hơn 11.000 audio clip đơn lẻ (từng phương án ở Part 1/2, từng lượt thoại ở Part 3/4) phục vụ tính năng Nghe Chép Chính Tả.
4. **Lưu trữ CSDL & Tự phân phối CDN:**
   * Nạp vào MongoDB với Schema chuẩn hóa (`MockTest`, `ListeningExercise`, `ReadingExercise`, `VocabularyTopic`).
   * Toàn bộ media lưu tại thư mục `/var/www/tuong-tan-toeic/media/` trên VPS Linux, phân phối qua Nginx với cơ chế đệm cache 1 năm.

---

## 5. Danh Mục Minh Chứng Trực Tiếp Để Mở Cho Thầy Xem

### A. Mở trực tiếp trên Trình duyệt Web (Live Links 200 OK)
* **Web thực tế đang chạy:** `https://toeic.danganhtuong.dev/` (hoặc `http://localhost:3000`)
* **Link ảnh Part 1 ETS thật (Self-hosted CDN):** `https://toeic.danganhtuong.dev/media/listening/part1/p1_ets_1.webp`
* **Link audio Part 1 ETS thật (Self-hosted CDN):** `https://toeic.danganhtuong.dev/media/listening/part1/p1_ets_1.mp3`
* **Link đề thi Full 200 câu (Test 9 ETS 2026):**
  * Audio: `https://toeic.danganhtuong.dev/media/mocktests/test9/q1.mp3`
  * Ảnh chụp: `https://toeic.danganhtuong.dev/media/mocktests/test9/q1.jpg`

### B. Mở trực tiếp trong Cơ sở dữ liệu (Database Viewer)
* **Công cụ:** MongoDB Compass
* **Chuỗi kết nối:** `mongodb://127.0.0.1:27017`
* **Tên Database:** `tuong_tan_toeic`
* **Các Collections chứng minh:**
  * `mocktests`: 10 đề thi ETS 2026 (mỗi đề chứa đúng 200 câu hỏi, link audio và ảnh chụp trực tiếp).
  * `listeningexercises`: 224 tài liệu luyện nghe (chứa 31.015 câu hỏi/lượt thoại).
  * `readingexercises`: 76 tài liệu luyện đọc (chứa 13.596 câu hỏi Part 5, 6, 7).
  * `vocabularytopics`: 83 chủ đề (chứa 7.551 từ vựng có phiên âm và âm thanh).
