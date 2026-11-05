# 🎓 KI: BẢO VỆ ĐỒ ÁN CHUYÊN ĐỀ CNTT — MINH CHỨNG NGUỒN GỐC DỮ LIỆU & BÁO CÁO TỔNG KẾT

## 1. Thông Tin Báo Cáo Chuyên Đề CNTT (Trường Đại Học Thủy Lợi)
- **Tác giả:** Đặng Anh Tường (MSSV: `2351067120`, Lớp: `S26-65CNTT`)
- **Giảng viên hướng dẫn:** ThS. Hoàng Văn Qúy
- **Cơ quan:** Bộ Nông nghiệp & Phát triển Nông thôn / Trường Đại học Thủy Lợi / Khoa Công nghệ Thông tin
- **File Báo Cáo Chính Thức:**
  - `A:\anhapp\Bao_cao_de_tai_cdcntt_danganhtuong.docx` (Bản hoàn chỉnh 9 chương, 36.135 ký tự, 7.276 từ)
  - Backup: `A:\anhapp\Bao_cao_de_tai_cdcntt_danganhtuong_backup.docx`
- **4 Lựa chọn Tên Đề Tài Chốt:**
  1. *Đậm chất thương mại / Đồ án Flagship:* **"XÂY DỰNG NỀN TẢNG LUYỆN THI TOEIC TRỰC TUYẾN 'TƯỜNG TẬN TOEIC' TÍCH HỢP PHÒNG THI CHUẨN ETS VÀ THUẬT TOÁN SM-2"**
  2. *Chuẩn Kỹ sư Phần mềm CNTT:* **"XÂY DỰNG HỆ THỐNG HỌC VÀ LUYỆN THI TOEIC TRỰC TUYẾN DỰA TRÊN NGĂN XẾP CÔNG NGHỆ MERN STACK"**
  3. *Nhấn mạnh Đột phá Sư phạm:* **"XÂY DỰNG HỆ THỐNG TỰ HỌC VÀ THI THỬ TOEIC TRỰC TUYẾN TÍCH HỢP NGHE CHÉP CHÍNH TẢ VÀ GHI NHỚ NGẮT QUÃNG"**
  4. *Chuẩn mực hàn lâm:* **"XÂY DỰNG HỆ THỐNG HỌC VÀ THI TOEIC TRỰC TUYẾN TOÀN DIỆN"**

---

## 2. Bản Đồ Nguồn Gốc Dữ Liệu (Ground Truth & Data Provenance Map)

### A. Tầng Bản Quyền & Học Thuật Quốc Tế (Official & Academic Tier)
1. **Viện Khảo Thí Hoa Kỳ (ETS - ets.org):**
   - Đơn vị sở hữu bản quyền bài thi TOEIC thương mại toàn cầu.
   - Chính sách: Không public đề thi 200 câu miễn phí lên web; chỉ cung cấp Examinee Handbook và Sample Questions.
2. **Nhà Xuất Bản YBM Hàn Quốc (ybmbooks.com):**
   - Đơn vị độc quyền được ETS ủy quyền xuất bản sách in *ETS TOEIC Regular Test Practice 1000* (Vol 1, 2, 3, 4, 2026).
   - Chính sách âm thanh: Cung cấp miễn phí 100% tệp Audio MP3 chính thức trên thư viện trực tuyến (도서자료실) để người học tải về.
3. **Kaggle Riiid AIEd Challenge (kaggle.com/competitions/riiid-test-answer-prediction/data):**
   - Bộ dữ liệu nghiên cứu AI / Knowledge Tracing lớn nhất thế giới của tập đoàn Riiid Labs (Santa TOEIC).
   - Chứa 13.523 câu hỏi chuẩn ETS (`questions.csv`), nhãn Part 1-7, và hơn 100 triệu lượt tương tác của học viên (`train.csv`).

### B. Tầng Học Liệu Mở & Sách In Scan (Open Educational Resources - OER)
1. **Kho Google Drive Công Khai:**
   - Link thư mục công khai: `https://drive.google.com/drive/folders/1SpDCZmoVs1idOouoEtQ069o9SYJKCGy3` (`ETS TOEIC 1000 VOL 4 (ETS 2024)` do `tailieutoeictuvo` chia sẻ).
   - Chứa đầy đủ: `NGHE FULL TEST`, `NGHE TỪNG PART (1-4)`, `QUESTIONS (NGHE TỪNG CÂU - CHÉP CHÍNH TẢ)`, `ĐÁP ÁN`, `TỪ VỰNG`.
2. **Cổng Học Liệu Mở Việt Nam (Halo English, Tiếng Anh Thầy Quý):**
   - `https://haloenglish.edu.vn/bo-tai-lieu-ets-toeic-2024-pdf-audio-dich-giai-chi-tiet/`: Cung cấp danh mục tài liệu và link tải các năm ETS 2019, 2020, 2021, 2022, 2023, 2024.
   - Thư mục lưu trữ local: `A:\frontend\tuong_tan_toeic\ets_download\` chứa bản scan gốc (như `ETS_2026_TOEIC_LISTENING.pdf` 144 trang, `1000 LISTENING.pdf`, `DE_ETS_2019.zip`, `Keys_ETS_2019.zip`, `ETS_2021.rar`).

### C. Tầng Tham Chiếu Thực Nghiệm & Sư Phạm (Benchmarking & Extraction)
1. **Đậu TOEIC (`dauenglish.com`):**
   - Là nguồn đối soát và tham chiếu thực nghiệm cốt lõi của dự án.
   - Cung cấp dữ liệu bóc tách dạng câu hỏi tương tác, transcript, 175 câu ảnh scan nét cao Part 1, và dịch nghĩa tiếng Việt 100% cho 4 phương án A-B-C-D.
2. **Nền Tảng Study4 (`study4.com/tests/toeic/`):**
   - Nơi lưu trữ đề thi thi thử online 200 câu theo từng năm (ETS 2018 - 2024).

---

## 3. Kiến Trúc Kỹ Thuật Tự Chủ (Zero-Dependency & Self-Hosted CDN)
- **Cơ sở dữ liệu:** MongoDB Local (`tuong_tan_toeic`) nạp qua file `backend/scripts/tuong_tan_toeic_prod.json.gz` bằng script `backend/scripts/import_db_node.js`.
- **Media CDN:** 100% Audio và Hình ảnh được tự host trực tiếp trên VPS Linux tại `/var/www/tuong-tan-toeic/media/`, phân phối qua Nginx với cache 1 năm. Tuyệt đối 0 liên kết Supabase, 0 lỗi đứt gãy link.
- **Production URL:** `https://toeic.danganhtuong.dev`

---

## 4. Kịch Bản Bảo Vệ Tuyệt Đối Trước Giảng Viên (Defense Script)
> *"Dạ thưa Thầy, để xây dựng được cơ sở dữ liệu cho hệ thống:*
> 1. *Về đề thi gốc: Em tiếp cận các bộ đề ETS từ các cổng học liệu mở (Halo, Drive) và đối soát với quy chuẩn phát hành của ETS / YBM Books.*
> 2. *Về xử lý sư phạm: Sách PDF chỉ là văn bản tĩnh không thể tương tác; em tiến hành tham chiếu và đối soát chéo với nền tảng Đậu TOEIC (`dauenglish.com`) để thu thập dữ liệu câu hỏi có cấu trúc, transcript và lời giải thích tiếng Việt chuẩn xác.*
> 3. *Về giải pháp kỹ thuật: Em viết bộ chuyển đổi ETL, chuẩn hóa dữ liệu vào MongoDB và tự lưu trữ 100% file âm thanh/hình ảnh trên máy chủ VPS Linux riêng của em tại `toeic.danganhtuong.dev` để hệ thống vận hành hoàn toàn độc lập và ổn định."*
