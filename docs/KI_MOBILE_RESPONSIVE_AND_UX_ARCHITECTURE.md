# 📱 TƯỜNG TẬN TOEIC — KI MOBILE RESPONSIVE & NATIVE APP UX ARCHITECTURE

> **Tài liệu Kiến trúc & Tiêu chuẩn Giao diện Mobile**  
> **Ngày ban hành / cập nhật:** 04/09/2026  
> **Áp dụng cho:** Toàn bộ hệ thống giao diện Frontend `tuong_tan_toeic` (Mobile 360px - 430px, Tablet 768px - 1024px, Desktop 1280px - 1920px+).

---

## 1. Mục Tiêu & Triết Lý Thiết Kế
Trải nghiệm học tập TOEIC trên điện thoại thông minh phải đạt chuẩn mượt mà, tiện lợi và tự nhiên tương đương ứng dụng Native App (iOS / Android):
- **Không bao giờ tràn chiều ngang (`overflow-x: hidden`)**: Tuyệt đối không để xảy ra hiện tượng thanh cuộn ngang làm méo mó trang.
- **Khu vực bấm ngón cái (Thumb-Friendly)**: Các thao tác chính được đặt ở nửa dưới màn hình với thanh điều hướng cố định chân trang.
- **Chế độ tập trung (Focus Mode Auto-Hide)**: Khi học viên vào phòng thi thử, làm bài đọc Part 6/7, nghe chép chính tả hay đấu trường 1v1, thanh điều hướng chân trang tự động ẩn hoàn toàn để tối đa hóa diện tích làm bài.
- **Phân đoạn linh hoạt (Segmented Views)**: Không xếp chồng bài đọc và câu hỏi thành danh sách cuộn dọc 2.500px gây mỏi tay; thay vào đó sử dụng bộ điều khiển phân đoạn chuyển tab tức thì.

---

## 2. Các Thành Phần Kiến Trúc Cốt Lõi

### A. Thanh Điều Hướng Ngón Cái Cố Định (`MobileBottomNav.jsx`)
- **Tập tin:** `frontend/src/components/MobileBottomNav.jsx`
- **Vị trí ghim:** `fixed bottom-0 left-0 right-0 z-40 bg-[#070b14]/95 backdrop-blur-2xl border-t border-slate-800/80`
- **Hỗ trợ chuẩn iOS Safe Area:** Sử dụng `pb-[max(0.5rem,env(safe-area-inset-bottom))]` để nút không bị che bởi vạch Home Indicator của iPhone.
- **5 Tabs điều hướng + 1 Nút Menu mở rộng:**
  1. `Trang chủ` (`/`)
  2. `Luyện nghe` (`/listen`)
  3. `Luyện đọc` (`/read`)
  4. `Từ vựng` (`/vocabulary`)
  5. `Đề thi` (`/tests`)
  6. `Thêm` (phát sự kiện `open_mobile_menu` kích hoạt Drawer trượt toàn màn hình)
- **Tự động ẩn thông minh (Auto-Hide):** Ẩn trên các route:
  - `/tests/room/*`, `/read/practice/*`, `/reading/article/*`, `/listen/practice/*`, `/listen/dictation/*`, `/listen/level-practice`, `/grammar/*`, `/battle`.

### B. Slide-Out Menu Drawer Toàn Màn Hình (`MobileMenuDrawer.jsx`)
- **Tập tin:** `frontend/src/components/MobileMenuDrawer.jsx`
- **Cơ chế React Portal:** Gắn trực tiếp vào `document.body` bằng `createPortal(..., document.body)` với `z-[9999]`.
- **Lợi ích kỹ thuật:** Thoát khỏi hoàn toàn ngữ cảnh stacking `backdrop-filter` hay `transform` của thẻ header cha, đảm bảo trượt mượt mà trên Safari iOS và Chrome Mobile.
- **Nội dung thẻ Drawer:**
  - Tiêu đề & Nút đóng `[✕]`.
  - Thẻ thông tin học viên: Avatar, Tên hiển thị, Email, Huy hiệu VIP PRO.
  - Thông số học tập thời gian thực: Chuỗi ngày học `🔥 X ngày`, Thời gian học hôm nay `⏱ Xh Ym`.
  - Lối tắt tính năng: **Sổ tay câu sai** (`/mistakes`), **Đấu trường 1v1** (`/battle`), **Bảng xếp hạng** (`/leaderboard`), **Trang cá nhân & Mục tiêu** (`/hub`), **Video bài giảng Vietsub** (`/video`).
  - Nút Đăng xuất an toàn (`handleLogout`).

### C. Quy Tắc Tinh Gọn Header Trên Mobile (`Navbar.jsx`)
- **Tập tin:** `frontend/src/components/Navbar.jsx`
- **Nguyên nhân lỗi 510px cũ:**
  - Header ban đầu xếp cạnh nhau: `Logo (200px)` + `VIP GOLD (85px)` + `Đồng hồ 2h 27m (85px)` + `Streak (50px)` + `Hamburger (40px)` + `Avatar (50px)` = 510px.
  - Trên màn hình điện thoại < 500px, các phần tử bên phải bị đẩy văng ra ngoài màn hình làm mất nút Menu Hamburger.
- **Tiêu chuẩn thiết kế mới (Bảo toàn vĩnh viễn):**
  1. **Huy hiệu VIP:** Rút gọn chỉ hiển thị icon vương miện `👑` trên `< sm`.
  2. **Đồng hồ học tập (`useStudyTime`):** Chuyển sang `hidden md:flex`. Trên mobile hiển thị to rõ trong Drawer và User Hub.
  3. **Streak:** Rút gọn thành `🔥 X` trên `< sm`.
  4. **Nút Hamburger `[ ☰ ]`:** Luôn hiển thị trên `< lg` với `shrink-0 active:scale-95`, ghim cố định góc trên cùng bên phải.
  5. **Avatar / Đăng nhập:** Ẩn trên `< lg` (`hidden lg:block`), toàn bộ tài khoản quản lý qua Drawer.
  6. Tổng chiều rộng header trên mobile chỉ còn **~268px**, an toàn tuyệt đối trên mọi màn hình từ 320px đến 430px+.

### D. Bộ Điều Khiển Phân Đoạn Bài Đọc Part 6 & Part 7 (`ReadingPractice.jsx`)
- **Tập tin:** `frontend/src/pages/ReadingPractice.jsx`
- Thay thế việc xếp chồng bài đọc và 4 câu hỏi bằng **Mobile Segmented Controller**:
  - `[ 📄 Bài đọc (Đoạn văn X) ]` ↔ `[ ✍️ Câu hỏi (X/4) ]`
  - Nút chuyển tiếp lớn ở cuối bài đọc: `[ CHUYỂN SANG LÀM BÀI (4 CÂU HỎI) ➔ ]`.
  - Nút nổi ghim góc phải dưới: `[ 👁️ Xem lại bài đọc ]` cho phép học viên lật lại xem dữ kiện bài đọc tức thì mà không bị mất đáp án đang chọn.

### E. Drawer Slide-Out Cho Phòng Nghe Chép & Từ Vựng
- **`ListeningDictation.jsx`:** Danh sách bài và câu hỏi chuyển thành Drawer trượt cạnh khi bấm `[ 📄 DS Câu ]`, tự động đóng lại khi học viên chọn câu hỏi.
- **`VocabularyPractice.jsx`:** Sidebar 7 Parts TOEIC chuyển thành Drawer trượt khi bấm `[ 📚 Phần học ]`.

### F. Kiến Trúc Cài Đặt Ứng Dụng Độc Lập PWA (Progressive Web App)
- **Tập tin:** `frontend/public/sw.js`, `frontend/public/manifest.json`, `frontend/src/components/InstallAppModal.jsx`.
- **Cơ chế hoạt động:**
  1. **Không cần App Store**: Học viên cài trực tiếp từ Safari (iOS) hoặc Chrome (Android) với 1 chạm.
  2. **Chạy toàn màn hình (Standalone)**: Biến mất hoàn toàn thanh URL duyệt web, trải nghiệm chuẩn Native App.
  3. **Service Worker Shell Cache**: Cache giao diện tĩnh siêu tốc, **bỏ qua 100% các request `/api/*`** để bảo đảm dữ liệu học tập và thời gian học đồng bộ trực tiếp lên MongoDB VPS.
  4. **Hướng dẫn trực quan**: `InstallAppModal.jsx` tích hợp trong `MobileMenuDrawer.jsx` (`PWA ⚡` badge) hiển thị các bước cài đặt cụ thể cho từng hệ điều hành.

### G. Cam Kết Bảo Vệ Dữ Liệu Cá Nhân Học Viên (Data Integrity & Disaster Recovery)
- **Độc lập tuyệt đối giữa Code và Data**:
  - Mã nguồn: `/var/www/tuong-tan-toeic/` (chỉ cập nhật code web, không chạm DB).
  - Dữ liệu MongoDB: `/var/lib/mongodb/` (WiredTiger DB files trên host VPS).
- **Sao lưu tự động 03:00 AM**: Kịch bản `/usr/local/bin/backup_tuong_tan_toeic_db.sh` tự động dump và nén `.archive.gz` toàn bộ 14 collections vào `/var/backups/mongodb/` mỗi đêm, bảo lưu 7 ngày.
- **Multi-tenant Isolation**: Mọi học viên (cũ và mới) được định danh bằng ObjectId bất biến, mật khẩu mã hóa bcrypt 10 salt rounds, câu sai và tiến độ học tập gắn chặt với `userId`.

---

## 3. Tiêu Chuẩn CSS Toàn Cục (`index.css`)
```css
@layer base {
  html, body {
    @apply bg-[#0b1120] text-slate-100 min-h-screen overflow-x-hidden font-sans selection:bg-cyan-500 selection:text-slate-950;
    max-width: 100vw;
  }
}
```
- **Quy tắc tuyệt đối:** Không đặt thuộc tính âm margin (`-mx-4`, `-ml-6`) hoặc độ rộng cố định (`w-[500px]`, `min-w-[600px]`) nếu không có tiền tố responsive (`sm:`, `md:`, `lg:`).
- **Khu vực chạm cảm ứng:** Mọi nút bấm trên mobile phải có `min-h-[44px]` hoặc `min-w-[44px]` để đảm bảo thao tác ngón tay chính xác 100%.
- **Hỗ trợ iOS Safe Area:** Thẻ `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />` bắt buộc có `viewport-fit=cover` để kích hoạt CSS `env(safe-area-inset-bottom)`.

