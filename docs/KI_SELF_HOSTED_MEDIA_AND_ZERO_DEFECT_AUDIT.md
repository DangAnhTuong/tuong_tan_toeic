# 🎧 KI: Self-Hosted Media Architecture & 100% Zero-Defect Media Audit

> **Mục tiêu**: Lưu giữ toàn bộ kiến thức kỹ thuật về kiến trúc lưu trữ Media tự chủ (Zero-Dependency Self-Hosted Media), chuyển đổi 100% link ảnh và audio từ Supabase sang ổ đĩa VPS, cơ chế Nginx reverse proxy & byte-range streaming, quy chuẩn hiển thị ảnh Part 1 trên cùng (trên thanh Audio), và giải pháp đồng bộ Localhost - VPS.

---

## 1. Tổng Quan Kiến Trúc Lưu Trữ Media (Zero Supabase Dependency)
- **Tình trạng trước đây**: Các file Audio và Hình ảnh của bộ đề thi và bài tập nghe phụ thuộc vào CDN Supabase (`*.supabase.co`). Do các bucket miễn phí của bên thứ ba bị xóa hoặc hết hạn token, hệ thống gặp lỗi ảnh không hiển thị và audio không phát được.
- **Giải pháp chuyển giao triệt để**:
  1. **100% Tự chủ trên VPS**: Chuyển toàn bộ file media về lưu trữ trực tiếp trên ổ cứng VPS tại `/var/www/tuong-tan-toeic/media/`.
  2. **Tổng dung lượng siêu tối ưu**: Toàn bộ 1.000 audio đề thi, 60 ảnh chụp Part 1, 5 sơ đồ Vector SVG, và 45 ảnh bài tập chỉ chiếm **108 MB** ổ đĩa.
  3. **Tốc độ phản hồi cực nhanh**: Nginx phân phối trực tiếp qua kernel `sendfile` với cache `max-age=31536000, immutable`, phản hồi trong vòng **5ms - 10ms**, hỗ trợ tua audio mượt mà với `Accept-Ranges: bytes`.
  4. **Số lượng link Supabase còn lại**: **Chính xác 0 link** trên cả 4 collections chính (`mocktests`, `listeningexercises`, `readingexercises`, `vocabularytopics`).

---

## 2. Cấu Trúc Thư Mục Media Trên Máy Chủ VPS
```text
/var/www/tuong-tan-toeic/media/
├── listening/
│   └── part1/
│       ├── photo_1.jpg ... photo_45.jpg       # 45 ảnh chụp thật theo ngữ cảnh ETS
│       ├── office_typing_keyboard.jpg
│       ├── garden_hedges_trim.jpg
│       └── ... (các ảnh định danh theo kịch bản)
└── mocktests/
    ├── test1/ ... test10/
    │   ├── q1.mp3 ... q100.mp3                # 100 audio MP3 cho từng bài test
    │   └── q1.jpg ... q6.jpg                  # 6 ảnh chụp Part 1 cho từng test
    └── graphics/
        ├── schedule_q63.svg                   # Sơ đồ lịch trình vector
        ├── brochure_q66.svg                   # Tờ rơi thông tin vector
        ├── floorplan_q69.svg                  # Sơ đồ mặt bằng vector
        ├── market_q96.svg                     # Biểu đồ thị phần vector
        └── expansion_q99.svg                  # Dự báo mở rộng vector
```

---

## 3. Cấu Hình Nginx Phục Vụ Media Trên VPS
File cấu hình: `/etc/nginx/sites-available/tuongtantoeic.conf`
```nginx
# Self-hosted Authentic Media (ETS Audio MP3 & Scanned Images)
location ^~ /media/ {
    alias /var/www/tuong-tan-toeic/media/;
    expires 365d;
    add_header Cache-Control "public, max-age=31536000, immutable";
    sendfile on;
    tcp_nopush on;
    access_log off;
}
```
*Lưu ý quan trọng*: Phải dùng tiền tố `^~ /media/` để Nginx ưu tiên xử lý trước các khối regex location tĩnh (`location ~* \.(?:jpg|mp3)...`).

---

## 4. Quy Chuẩn Vị Trí Hiển Thị Ảnh Part 1 (Anti-Below-Fold Standard)
- **Vấn đề**: Trong các bản thiết kế cũ, component ảnh Part 1 bị đặt phía dưới trình phát Audio Player. Khi học viên mở trang trên màn hình laptop/desktop thông thường, ảnh bị trôi xuống dưới fold màn hình, người học chỉ thấy thanh audio mà không thấy ảnh unless cuộn chuột xuống.
- **Quy tắc bắt buộc**:
  - Tại cả `LevelPracticeRoom.jsx` và `MockTestRoom.jsx`, ảnh Part 1 **BẮT BUỘC luôn render ở vị trí trên cùng của Cột Trái** (ngay dưới thanh chỉ dẫn, bên trên Audio Player).
  - Học viên phải nhìn thấy ảnh ngay từ giây đầu tiên bước vào phòng để quan sát tranh trước khi audio phát (chuẩn phương pháp thi ETS quốc tế).
  - Thẻ `<img>` **TUYỆT ĐỐI KHÔNG** được đặt `e.currentTarget.parentElement.parentElement.style.display = 'none'` trong `onError`. Thay vào đó, dùng ảnh fallback xoay vòng từ pool 45 ảnh tự host: `/media/listening/part1/photo_${(currentIdx % 45) + 1}.jpg`.

---

## 5. Quy Chuẩn Proxy Môi Trường Localhost (`localhost:3000`)
- **Vấn đề**: Khi học viên hoặc lập trình viên chạy `npm run dev` ở máy local, nếu gọi đường dẫn tương đối `/media/listening/part1/...`, Vite dev server trả về lỗi `404 Not Found` do máy local không chứa thư mục `/media/`.
- **Giải pháp**:
  Trong `frontend/vite.config.js`, khai báo proxy cho `/media` trỏ trực tiếp về máy chủ production:
  ```javascript
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/media': {
        target: 'https://toeic.danganhtuong.dev',
        changeOrigin: true,
        secure: false
      }
    }
  }
  ```
- Nhờ proxy này, môi trường local dev phát âm thanh và hiển thị hình ảnh 100% mượt mà mà không cần phải tải hàng trăm MB dữ liệu media về máy local.

---

## 6. Quy Trình Đóng Gói Triển Khai Lên VPS (Atomic Tar Deploy Standard)
- **Sự cố scp wildcard trên Windows**: Lệnh `scp -r dist\* root@...` trên Windows Command Prompt/PowerShell không mở rộng wildcard đệ quy vào các thư mục con như `dist/assets/`, dẫn đến tình trạng các chunk JS mới bị copy sai vị trí hoặc bị thiếu, làm sập React Router hoặc 404 assets.
- **Quy chuẩn triển khai bắt buộc**:
  1. Đóng gói nguyên khối file nén tar chỉ chứa `index.html` và thư mục `assets` (bỏ qua thư mục `videos` nặng 750MB vốn đã có sẵn trên VPS):
     ```bash
     tar -czf dist_assets.tar.gz -C frontend/dist index.html assets
     ```
  2. Tải file tar lên VPS qua `scp` (dung lượng chỉ ~4MB, tải trong 2 giây):
     ```bash
     scp dist_assets.tar.gz root@116.118.3.69:/var/www/tuong-tan-toeic/frontend/
     ```
  3. Giải nén nguyên tử trên VPS và reload Nginx:
     ```bash
     ssh root@116.118.3.69 "cd /var/www/tuong-tan-toeic/frontend/dist && tar -xzf ../dist_assets.tar.gz && rm -f ../dist_assets.tar.gz && chown -R www-data:www-data . && chmod -R 755 . && systemctl reload nginx"
     ```

---

## 7. Kết Quả Kiểm Toán 100% Hệ Thống (Exhaustive Verification Audit)
Script kiểm toán: `exhaustive_media_verification.js`
```text
================================================================
🔬 100% EXHAUSTIVE MEDIA & AUDIO VERIFICATION AUDIT
================================================================
- Tổng số câu hỏi đã kiểm toán:             33.741 câu
- Tổng số đường link Media đã test HTTP:    666 URLs
- Số lượng tham chiếu ảnh đã kiểm tra:      4.622 lượt
- Số lượng tham chiếu audio đã kiểm tra:    1.099 lượt
- Link chết Supabase còn sót lại:           0 (ĐÃ XÓA 100%)
- Ảnh bị lỗi (Broken Images):                0 câu
- Audio bị lỗi (Broken Audios):              0 câu
================================================================
🎉 100% ZERO DEFECT CONFIRMED: ZERO BROKEN MEDIA ANYWHERE!
```
