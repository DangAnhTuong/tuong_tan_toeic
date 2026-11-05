# 📊 BÁO CÁO THỐNG KÊ, THẨM ĐỊNH NGUỒN GỐC & ĐỐI SOÁT HỌC LIỆU TOEIC VỚI STUDY4 VÀ ĐẬU TOEIC

* **Đề tài Chuyên đề / Đồ án:** Xây Dựng Nền Tảng Luyện Thi TOEIC Chuẩn Khảo Thí Quốc Tế — Tường Tận TOEIC
* **Sinh viên thực hiện:** Đặng Anh Tường — Khoa CNTT, Trường Đại học Thủy Lợi (Cơ sở 2 - TP.HCM)
* **Tên miền vận hành trực tuyến:** `https://toeic.danganhtuong.dev`
* **File Excel thống kê đầy đủ:** [Bao_Cao_Thong_Ke_Hoc_Lieu_TOEIC_STUDY4_DauTOEIC.xlsx](file:///a:/frontend/tuong_tan_toeic/Bao_Cao_Thong_Ke_Hoc_Lieu_TOEIC_STUDY4_DauTOEIC.xlsx)
* **File Word giải trình khoa học:** [Bao_Cao_Doi_Chieu_Nguon_Hoc_Lieu_TOEIC_Study4_DauTOEIC.docx](file:///a:/frontend/tuong_tan_toeic/Bao_Cao_Doi_Chieu_Nguon_Hoc_Lieu_TOEIC_Study4_DauTOEIC.docx)

---

## 1. TỔNG QUAN KHỐI LƯỢNG HỌC LIỆU TOÀN SÀN

| STT | Phân hệ nghiệp vụ | Số lượng bài / Đề | Tổng số câu hỏi / từ | Định dạng Media | Nguồn đối soát chuẩn | Tỷ lệ tự host CDN |
| :---: | :--- | :---: | :---: | :--- | :--- | :---: |
| **1** | **Bộ Đề Thi Thử Full 200 Câu (Mock Tests)** | **50 bộ đề** | **10.000 câu hỏi** | 100% Audio MP3 + Ảnh scan ETS | **STUDY4** (`study4.com/tests/toeic/`) | 100% (VPS Nginx) |
| **2** | **Luyện Nghe Part 1 (8 Level & 4 Dạng)** | **12 tài liệu** | **450 câu hỏi** | 450 ảnh scan + 450 audio gốc | **Đậu TOEIC** (`dauenglish.com/listen`) | 100% (VPS Nginx) |
| **3** | **Luyện Nghe Part 2, 3, 4 (Level & Topic)** | **60 tài liệu** | **7.525 câu hỏi** | Audio hội thoại + 55 Graphic ETS | **Đậu TOEIC** (`dauenglish.com/listen`) | 100% (VPS Nginx) |
| **4** | **Nghe Chép Chính Tả (Dictation)** | **556 bài tập** | **11.785 câu thoại** | 11.785 audio clips cắt lát đơn câu | **Đậu TOEIC** (`dauenglish.com/listen`) | 100% (VPS Nginx) |
| **5** | **Luyện Đọc Part 5, 6, 7 theo Level** | **24 tài liệu** | **7.500 câu hỏi** | Text + Dịch nghĩa + Lời giải bẫy | **Đậu TOEIC** / **STUDY4** | 100% (CSDL MongoDB) |
| **6** | **Ngữ Pháp & Bộ Đề Tổng Hợp Part 5** | **23 chuyên đề & năm** | **2.488 câu hỏi** | Lý thuyết + Bài tập 14 chủ đề | **Đậu TOEIC** (`dauenglish.com/read`) | 100% (CSDL MongoDB) |
| **7** | **Đọc Báo Song Ngữ Anh - Việt** | **31 bài đọc** | **124 câu hỏi** | Song ngữ EN/VI + Hộp từ vựng | **Đậu TOEIC** (`dauenglish.com/read`) | 100% (CSDL MongoDB) |
| **8** | **Kho Từ Vựng Spaced Repetition (SM-2)** | **83 chủ đề** | **7.551 từ vựng** | Audio US/UK + Phiên âm + Ví dụ | **Đậu TOEIC** (`dauenglish.com/vocabulary`) | 100% (VPS Nginx) |
| 🎯 | **TỔNG CỘNG HỆ THỐNG** | **759 BÀI / ĐỀ** | **46.898 CÂU HỎI & TỪ** | **ĐẦY ĐỦ AUDIO & ẢNH SCAN** | **STUDY4 & ĐẬU TOEIC** | **100% TỰ HOST** |

---

## 2. DANH MỤC LINK ĐỐI CHIẾU THỰC TẾ TRÊN STUDY4 (100% HOẠT ĐỘNG, 0 LỖI 404)

* Thư viện tổng thể: `https://study4.com/tests/toeic/`
* Phòng thi trực tiếp trên Tường Tận TOEIC: `https://toeic.danganhtuong.dev/tests`

| Nhóm Bộ Đề Thi ETS | Link đối chiếu trên STUDY4 (Thực tế) | Link làm đề trực tiếp trên Tường Tận TOEIC |
| :--- | :--- | :--- |
| **Collection 1 (Test 1 - 10)** | `https://study4.com/tests/6852/toeic-lr-collection-1-test-1/` đến `...6861/` | `https://toeic.danganhtuong.dev/tests` |
| **Collection 2 (Test 1 - 10)** | `https://study4.com/tests/7000/toeic-lr-collection-2-test-1/` đến `...7009/` | `https://toeic.danganhtuong.dev/tests` |
| **Collection 3 (Test 1 - 10)** | `https://study4.com/tests/7050/toeic-lr-collection-3-test-1/` đến `...7059/` | `https://toeic.danganhtuong.dev/tests` |
| **Collection 4 (Test 1 - 10)** | `https://study4.com/tests/7060/toeic-lr-collection-4-test-1/` đến `...7069/` | `https://toeic.danganhtuong.dev/tests` |
| **Sample Tests (Test 1 - 10)** | `https://study4.com/tests/227/sample-toeic-test-1/` đến `...226/` | `https://toeic.danganhtuong.dev/tests` |
