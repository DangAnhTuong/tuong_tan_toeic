# 🛡️ KI: Security Hardening, Incident Alerts, and React Hook Guardrails

## 1. Executive Summary
This Knowledge Item documents critical system hardening, real-time alert infrastructure, and React architecture rules implemented for **Tường Tận TOEIC** (`https://toeic.danganhtuong.dev`).

---

## 2. Security Hardening & Zero Vulnerability Architecture (DO NOT REVERT)

### A. Webhook Payment Protection (Anti-Hijack & Anti-Bypass)
- **File**: `backend/src/controllers/payment.controller.js`
- **Vulnerability Solved**: Previously, incoming requests containing `subAccount === '0335847674'` could bypass secret verification.
- **Enforcement**:
  - Enforced mandatory `PAYMENT_WEBHOOK_SECRET` verification across all webhook calls.
  - Checks headers: `x-api-key`, `Authorization: Bearer <secret>`, `x-sepay-key`, `x-payos-key`, query param `secret`, or payload `secret`/`apiKey`.
  - Rejects unauthorized requests immediately with `401 Unauthorized`.
  - Banking destination details (`MB Bank - 0335847674 - DANG ANH TUONG`) are strictly hardcoded on the backend server; malicious actors cannot modify the payee account or spoof payments.

### B. Attachment & User Input Sanitization (Anti-Stored XSS & Malware Links)
- **File**: `backend/src/utils/securitySanitizer.js`
- **Enforcement**:
  - Automatically sanitizes attachments in Feedback submissions (`Feedback.js`) and Chat messages (`ChatMessage.js`).
  - Blocks dangerous protocols: `javascript:`, `vbscript:`, `data:text/html`, `data:application/`.
  - Only allows safe protocols: `http:`, `https:`, and validated base64 image data URIs (`data:image/(png|jpeg|jpg|webp|gif);base64,...`).
  - Strips HTML tags and script elements from file names and descriptions.
  - Truncates oversized base64 strings (> 15MB) to protect database memory.

### C. Frontend Link Safety Guardrails
- **Files**: `frontend/src/components/FeedbackModal.jsx`, `frontend/src/pages/AdminDashboard.jsx`, `FloatingSocialChat.jsx`
- **Enforcement**:
  - All user-rendered external links run through `getSafeUrl(url)`: returns `#` if protocol is unsafe.
  - All anchor links strictly enforce `rel="noopener noreferrer"` and `target="_blank"`.

### D. Automated Security Test Suite
- **File**: `backend/src/test/securityAuditTest.js`
- **Status**: 11/11 automated security tests passing (webhook authentication, secret enforcement, attack payload filtering, XSS mitigation).

---

## 3. Real-time 24/7 Incident & Crash Telegram Alert System (DO NOT REVERT)

### A. Architecture
- **Bot**: `@tuongtan_toeic_alert_bot`
- **Admin Chat ID**: `6459107558`
- **Utility**: `backend/src/utils/telegramAlert.js`
- **Global Error Interceptor**: `backend/src/server.js`
  - Catches `uncaughtException` and `unhandledRejection` without taking down other PM2 clusters.
  - Express 500 error handler formats route, method, status code, IP, and stack trace before sending instant alert to Admin Telegram.
- **Uptime Monitoring**:
  - Health check endpoint `/health` responds with uptime, memory usage, and status `UP`.
  - Integrated with UptimeRobot for external 24/7 ping.

---

## 4. React Rules of Hooks & Root-Level Component Guardrails (DO NOT REVERT)

### A. The Bug & Root Cause
- **Incident**: Opening `/listen/level-practice?part=3&level=4` triggered React fatal error:
  `Error: Rendered fewer hooks than expected. This may be caused by an accidental early return statement.`
  Leading to ErrorBoundary displaying *"Đã xảy ra lỗi hiển thị"*.
- **Root Cause**: In `FloatingSocialChat.jsx` (which is mounted globally in `App.jsx`), an early return was added:
  ```javascript
  // ❌ FATAL BUG: Early return placed BEFORE 16 React hooks!
  if (!isAuthenticated || isAuthPage || isPracticeOrExam) return null;
  
  const [isOpen, setIsOpen] = useState(false);
  // ... 15 more hooks
  ```
  When navigating to `/listen/level-practice`, `isPracticeOrExam` became `true`, causing React to skip all 16 hooks on that render cycle, violating React's fundamental Rule of Hooks.

### B. Permanent Rule
- **RULE**: NEVER place route-based or auth-based conditional returns (`if (...) return null;`) before ANY React hook (`useState`, `useEffect`, `useRef`, `useCallback`, etc.).
- **CORRECT PATTERN**:
  ```javascript
  // 1. All hooks must execute unconditionally in the exact same order on EVERY render
  const [isOpen, setIsOpen] = useState(false);
  // ... other hooks ...
  
  // 2. Put condition right before the JSX return
  if (!isAuthenticated || isAuthPage || isPracticeOrExam) {
    return null;
  }
  
  return (
    <>
      {/* UI Elements */}
    </>
  );
  ```

---

## 5. UI/UX & Community Chat Standards (DO NOT REVERT)

### A. Floating Social Chat Visuals
- Pure dark theme `#0a0f1d` / `slate-900` with subtle `border-slate-800`.
- Zero distracting blur or transparency overlays on chat panel content.

### B. Chat Access Gate
- Guest users (not logged in) DO NOT see the floating chat launcher or dialog.
- Chat is strictly available only after successful registration/login (`isAuthenticated === true`).
