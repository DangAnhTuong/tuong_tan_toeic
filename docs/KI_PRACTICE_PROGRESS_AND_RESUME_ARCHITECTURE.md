# 🔄 KI: Universal Practice Progress Persistence & Đậu TOEIC Mascot Resume Architecture

> **Mục tiêu**: Lưu giữ toàn bộ kiến thức kỹ thuật về hệ thống lưu tiến độ luyện tập, tự động tiếp tục làm bài ở câu chưa trả lời tiếp theo, giao diện thẻ cấp độ chuẩn Đậu TOEIC với 4 nút hành động, và màn hình chuyển tiếp mascot chú mèo cơ bắp ("Đậu đang lưu tiến độ làm bài của bạn... •••").

---

## 1. Bối Cảnh & Vấn Đề Gốc
- **Vấn đề người dùng phản ánh**: Khi vào phòng làm bài (Reading, Listening, Dictation...), làm 3 câu (dù đúng hay sai) rồi bấm Thoát, ra ngoài thẻ cấp độ vẫn báo `0 câu` và không ghi nhận số câu đã làm. Khi bấm vào học tiếp thì bị reset lại bắt làm từ câu đầu tiên.
- **Yêu cầu**: Lập kế hoạch, khảo sát cơ chế chuẩn của Đậu TOEIC (`dautoeic.com`), tái hiện 100% chính xác từ giao diện thẻ, cơ chế lưu tiến độ, màn hình mascot chuyển tiếp khi thoát, cho đến thuật toán tự động nhảy đến câu hỏi tiếp theo, sau đó triển khai lên VPS và kiểm thử không tì vết.

---

## 2. Kiến Trúc Backend (Single Source of Truth)

### A. Mongoose Model: `UserPracticeProgress` (`backend/src/models/UserPracticeProgress.js`)
Lưu trữ tiến trình chi tiết của từng học viên cho từng bài luyện tập / cấp độ:
```javascript
const userPracticeProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { 
    type: String, 
    enum: ['reading', 'listening', 'dictation', 'mocktest', 'grammar', 'bilingual'], 
    required: true,
    index: true 
  },
  part: { type: String, default: '' },
  level: { type: Number, default: 1 },
  exerciseKey: { type: String, required: true, index: true }, // e.g. 'reading_part5_lv1'
  exerciseTitle: { type: String, default: '' },
  totalQuestions: { type: Number, default: 0 },
  completedCount: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  currentQuestionIdx: { type: Number, default: 0 },
  currentPassageIdx: { type: Number, default: 0 },
  userAnswersMap: { type: mongoose.Schema.Types.Mixed, default: {} }, // { "0": 2, "1": 1 }
  wrongQuestions: [{ type: Number }], // Danh sách index các câu làm sai để phục vụ "Làm lại câu sai"
  practiceXp: { type: Number, default: 0 },
  isCompleted: { type: Boolean, default: false },
  lastStudiedAt: { type: Date, default: Date.now }
}, { timestamps: true });

userPracticeProgressSchema.index({ userId: 1, exerciseKey: 1 }, { unique: true });
```

### B. REST API Endpoints (`/api/v1/practice-progress`)
- `POST /api/v1/practice-progress/save`: Upsert tiến độ làm bài (lưu ngay lập tức khi click chọn đáp án và khi bấm nút Thoát).
- `GET /api/v1/practice-progress/user`: Lấy toàn bộ tiến độ của học viên hiện tại để hiển thị trên Dashboard cards.
- `GET /api/v1/practice-progress/single/:exerciseKey`: Lấy tiến độ của 1 bài cụ thể.
- `DELETE /api/v1/practice-progress/reset/:exerciseKey`: Xóa tiến độ bài học khi học viên chọn reset.

---

## 3. Kiến Trúc Frontend (Client Synchronization & Dual-Storage)

### A. Dịch Vụ Đồng Bộ `practiceProgressService.js`
- Quản lý đồng bộ 2 chiều giữa MongoDB Backend và `localStorage` (dành cho khách vãng lai chưa đăng nhập và hoạt động ngoại tuyến).
- Tự động lấy JWT token từ `tuong_tan_toeic_jwt_token` hoặc `token`.

### B. Thẻ Cấp Độ Chuẩn Đậu TOEIC (`ReadingDashboard.jsx` & `ListeningDashboard.jsx`)
Mỗi thẻ cấp độ hiển thị đầy đủ:
1. **Chỉ số tổng quan**: `{completedCount}/{totalQuestions}`
2. **Badges kết quả**: `✓ {correctCount}` (màu xanh ngọc emerald), `✕ {wrongCount}` (màu đỏ hồng rose), thanh tiến độ `%`.
3. **4 Nút Hành Động Chuẩn**:
   - `[ 🛒 X ]`: Mở Drawer từ vựng đã lưu cho cấp độ/phần đó.
   - `[ ↺ Y ]`: Nút "Làm lại Y câu sai" với huy hiệu màu đỏ (chỉ mở khi có câu sai `wrongCount > 0`, mở phòng với query `&redo=true`).
   - `[ 🗑️ ]`: Modal xác nhận xóa tiến độ để học lại từ đầu.
   - `[ 📖 Luyện tập / Luyện tiếp / Luyện lại ]`:
     - Nếu `completedCount === 0`: Hiện "Luyện tập".
     - Nếu đang làm dở: Hiện "Luyện tiếp" (Click vào tự động chuyển tới câu chưa làm tiếp theo `currentQuestionIdx`).
     - Nếu đã xong: Hiện "Luyện lại".

### C. Màn Hình Mascot Thoát Bài Chuẩn Đậu TOEIC (`DauSavingProgressOverlay.jsx`)
- Tích hợp hình ảnh chú mèo mascot Đậu cơ bắp đeo kính râm (`dau_saving_progress.png`).
- Hiệu ứng 3 chấm xanh cyan chuyển động lấp lánh: *"Đậu đang lưu tiến độ làm bài của bạn... •••"*.
- Khi bấm "Thoát" trong `ExitModal`:
  1. Kích hoạt overlay ngay lập tức.
  2. Gửi request `POST /api/v1/practice-progress/save` lên server.
  3. Duy trì 1.2 giây tạo trải nghiệm mượt mà, sau đó điều hướng về đúng Dashboard kèm bảo toàn 100% URL parameters.

---

## 4. Các Phòng Luyện Được Tích Hợp
1. **Reading Practice (`ReadingPractice.jsx`)**: Part 5, 6, 7 (Hỗ trợ cả câu đơn và cụm đoạn văn Passage).
2. **Listening Level Practice (`LevelPracticeRoom.jsx`)**: Part 1, 2, 3, 4 theo Level và Chủ đề.
3. **Dictation (`ListeningDictation.jsx`)**: Chép chính tả theo năm và theo chủ đề.
4. **Grammar Lessons (`GrammarLesson.jsx`)**: 14 chuyên đề lý thuyết & bài tập ngữ pháp.
5. **Bilingual Reader (`BilingualReader.jsx`)**: 31 bài đọc song ngữ.
6. **Mock Test Practice Mode (`MockTestRoom.jsx`)**: Chế độ luyện tập 200 câu đề ETS.

---

## 5. Kết Quả Kiểm Thử Thực Tế (100% Verified)
- **Local Automated Tests**: `backend/src/test/practiceProgressTest.js` -> `100% PASS`.
- **Production Build**: `npm run build` -> Hoàn thành trong 8.29 giây với **0 errors, 0 warnings**.
- **VPS Deployment**: Đẩy lên VPS `116.118.3.69`, PM2 restart trực tiếp, Nginx phục vụ dist mới (`index-Dj-a_wPR.js`).
- **Database VPS**: Bản ghi `UserPracticeProgress` được ghi nhận thực tế vào MongoDB (`db.userpracticeprogresses.find()`).
- **E2E Browser Test**: Học viên làm bài -> thoát -> hiện mascot Đậu -> card cập nhật `3/486 ✓ 3 ✕ 0` -> bấm "Luyện tiếp" -> nhảy trực tiếp vào Câu số 4 với banner `🔄 Tiếp tục làm bài: Câu 4`.
