# 🔒 PRO GATE POLICY, 2-TIER PRICING & PRE-VPS DEPLOYMENT PLAYBOOK

> **Project**: Tường Tận TOEIC (`tuong_tan_toeic`)  
> **Last Updated**: September 2026  
> **Author**: Antigravity AI Agent  

---

## 1. Executive Summary & Core Rules
This document codifies the definitive Pro Gate access control policies, the 2-tier subscription model (Free vs 99k / 4 months), VietQR payment webhook architecture, and VPS production deployment specifications for Tường Tận TOEIC.

---

## 2. Complete Pro Gate Matrix (Khóa Nội Dung VIP)

All content is guarded via `<VipLockOverlay isLocked={condition} compact label="..." onUnlockClick={...}>`.

### 2.1. 🎧 Mô-đun Luyện Nghe (`/listen`)
* **Theo dạng bài Part 1**:
  * Free: *Tranh một người* (`idx === 0`).
  * PRO: *Tranh nhiều người*, *Tranh đồ vật / phong cảnh* (`idx > 0`).
* **Theo dạng bài Part 2**:
  * Free: *Câu khẳng định* (`idx === 0`) và *Câu hỏi Be/Do/Have* (`idx === 1`).
  * PRO: 10 dạng câu hỏi còn lại (`idx > 1`).
* **Theo dạng bài Part 3**:
  * Free: *Có hình / bảng biểu* (special `idx === 0`) & *Lịch hẹn, cuộc họp & tiến độ công việc* (topic `idx === 0`).
  * PRO: Tất cả các dạng còn lại (`idx > 0`).
* **Theo dạng bài Part 4**:
  * Free: *Có hình / bảng biểu* (special `idx === 0`) & *Nhà ở & dịch vụ đời sống* (topic `idx === 1`).
  * PRO: Tất cả các dạng còn lại (`idx !== 1`).
* **Nghe chép chính tả (Dictation - 11.785 câu)**:
  * **Tab Đề 2026, 2024, 2023**: Free trọn vẹn **Test 1** (Part 1 - 4); **Test 2 đến 10** khóa VIP (`idx > 0`).
  * **Tab Nghe theo chủ đề (24 topics)**: Free chủ đề đầu tiên của Part 3 & Part 4; các chủ đề còn lại khóa VIP.
  * **Tab TOEIC MASTER (9 topics)**: Free chủ đề đầu tiên (*Tranh người*); 8 chủ đề nâng cao sau khóa VIP.

### 2.2. 📖 Mô-đun Luyện Đọc (`/read`)
* **Ngữ pháp (Theo chủ điểm - 14 chuyên đề)**:
  * Free: 2 chuyên đề đầu (*Kiến thức cơ bản* `idx === 0`, *Danh từ* `idx === 1`).
  * PRO: 12 chuyên đề còn lại (`idx > 1`).
* **Ngữ pháp (Tổng hợp bộ đề theo năm - 9 bộ đề)**:
  * Free: 2 bộ đề đầu tiên (`idx <= 1`).
  * PRO: 7 bộ đề còn lại (`idx > 1`).
* **Đọc song ngữ Anh - Việt (75 bài đọc / 5 Levels)**:
  * Free: 1 bài đọc đầu tiên mỗi Level (`idx === 0`).
  * PRO: Các bài đọc còn lại (`idx > 0`).

### 2.3. 📚 Mô-đun Từ Vựng Spaced Repetition (`/vocabulary`)
* **Tab 600 Từ Vựng TOEIC (50 topics)**:
  * Free: **6 chủ đề đầu tiên** (`idx < 6`).
  * PRO: Chủ đề 7 đến 50 (`idx >= 6`).
* **Các Tab khác (Đề 2023, 2024, 2026, TOEIC MASTER)**:
  * Free: **1 chủ đề đầu tiên** (`idx === 0`).
  * PRO: Tất cả các chủ đề còn lại (`idx >= 1`).

### 2.4. 📝 Mô-đun Đề Thi Full ETS (`/tests`)
* Free: **Test 1** (Trọn vẹn 200 câu với cả 2 chế độ *Thi thử* và *Luyện tập*).
* PRO: **Test 2 đến Test 10** (`!isFreeTest`).

### 2.5. 🎤 Speaking & Writing
* Giữ nguyên giao diện cao cấp **"Sắp Ra Mắt" (Coming Soon)** với animation, lộ trình tính năng và nút điều hướng các kỹ năng khác.

---

## 3. Subscription Pricing & VietQR Architecture

### 3.1. The 2-Tier Pricing Model
```json
{
  "free": {
    "id": "free",
    "name": "Gói Miễn Phí (Free)",
    "price": 0,
    "durationDays": 3650,
    "isFree": true
  },
  "pro_4_months": {
    "id": "pro_4_months",
    "name": "Gói VIP Khai Trương (4 Tháng)",
    "price": 99000,
    "originalPrice": 199000,
    "durationDays": 120,
    "discountBadge": "🔥 Khai trương 10 ngày đầu — Giảm 50%"
  }
}
```

### 3.2. VietQR & Webhook Flow
1. **Dynamic VietQR**: URL format: `https://img.vietqr.io/image/MB-0335847674-compact2.png?amount=99000&addInfo=TOEIC{orderCode}&accountName=DANG%20ANH%20TUONG`.
2. **Order Code Syntax**: `TOEIC` + 5 random digits (e.g. `TOEIC65614`).
3. **Webhook Verification**: In `payment.controller.js` -> `handleWebhook`, regex captures `match(/TOEIC\d{5}/i)`.
4. **Idempotent Dual-Model Activation**:
   ```javascript
   // Automatically sets expiry = now + 120 days
   const { expiryDate } = await activateProAccount(order.userId, order.planId);
   // Updates both User model (JWT source of truth) and UserGoal model
   ```
5. **Instant Guest QR Generation**: Unauthenticated/guest visitors can create orders instantly without `401` errors; sessions upgrade cleanly upon payment.

---

## 4. Production VPS Deployment & Maintenance Checklist

### 4.1. Environment Variables (`.env`)
```bash
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/tuong_tan_toeic
JWT_SECRET=tuong_tan_toeic_super_secure_jwt_secret_2026
BANK_ID=MB
BANK_ACCOUNT_NO=0335847674
BANK_ACCOUNT_NAME=DANG ANH TUONG
PAYMENT_WEBHOOK_SECRET=your_sepay_casso_webhook_secret_here
```

### 4.2. Port Allocation Rules
* **Port 5000**: Backend Express API (`tuong_tan_toeic`).
* **Port 3000**: Frontend React Vite (or served via Nginx `dist/` directly on Port 80/443).
* *(Port 3001, 3005, 8000 are reserved for other workspaces)*.

### 4.3. PM2 Process Management
```bash
# Start backend
cd a:/frontend/tuong_tan_toeic/backend
pm2 start src/server.js --name "tuongtan-api"
pm2 save

# Build frontend
cd a:/frontend/tuong_tan_toeic/frontend
npm run build
```

---

## 5. VIP Single Source of Truth & Zero-Lockout Architecture (DO NOT REVERT)

1. **Zero-Lockout Principle**:
   - Once a user upgrades to VIP (e.g. VietQR payment completed, `isPro: true` in DB), they MUST IMMEDIATELY have full, unhindered access to all unlocked content across Part 1-7, Level 1-5, Dictation, Tests, and Vocabulary WITHOUT ANY RE-LOCKING, STALE CACHING, OR INFINITE PAYMENT MODAL DEADLOCKS.
2. **Backend Anti-Cache Security (`Cache-Control: no-store`)**:
   - All profile and status endpoints (`/api/v1/user/profile`, `/api/v1/payment/my-status`, `/api/v1/user/progress`) MUST send HTTP response header:
     `res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');`
   - Prevents browsers and CDNs from returning 304 Not Modified with stale `isPro: false` after a student successfully pays.
3. **Synchronous Client State Initialization (Anti-Flash-Lock)**:
   - Every component, dashboard, and practice room displaying Pro gates MUST initialize `isProUser` synchronously from `getStoredUser()`:
     `const [isProUser, setIsProUser] = useState(() => { const u = getStoredUser(); return Boolean(u?.isPro || u?.role === 'admin'); });`
   - NEVER initialize with `useState(false)`. Initializing with `false` causes a flash of locked cards and can incorrectly block users before async API calls resolve.
4. **Bi-Directional Profile Syncing (Self-Healing LocalStorage)**:
   - Whenever `GET /api/v1/user/profile` or `/api/v1/payment/my-status` resolves:
     1. Update component React state: `setIsProUser(Boolean(data.isPro || data.role === 'admin'))`.
     2. Immediately synchronize `setStoredUser({ ...stored, isPro: data.isPro, proTier: data.proTier, proExpiresAt: data.proExpiresAt, role: data.role })` if changed.
     3. Dispatch event `window.dispatchEvent(new Event('auth_state_changed'))` so all active components across the page update instantly.
5. **Pricing Modal Non-Deadlock Guarantee (`PricingModal.jsx`)**:
   - In `PricingModal.jsx`, when the modal detects `isPro: true` (Step `'already_vip'`), clicking `"Bắt Đầu Luyện Thi Ngay"` MUST:
     1. Call `setStoredUser` with `isPro: true`.
     2. Invoke `onUpgradeSuccess?.()`.
     3. Dispatch `auth_state_changed`.
     4. Call `onClose()`.
   - NEVER leave the button as a dead-end `onClick={onClose}` that returns the student to a locked screen!
   - Every `<PricingModal>` invocation MUST supply `onUpgradeSuccess={() => { setIsProUser(true); refreshProfile?.(); }}`.

