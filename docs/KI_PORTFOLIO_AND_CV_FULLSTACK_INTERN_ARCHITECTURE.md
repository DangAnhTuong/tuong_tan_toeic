# 📄 KI: Portfolio & Full-Stack Intern CV Architecture

## 1. Overview & Positioning
- **Candidate**: Đặng Anh Tường (`Dang Anh Tuong`)
- **Target Role**: Full-Stack / Frontend Software Engineer Internship
- **Portfolio Domain**: `https://www.danganhtuong.dev` (Vercel automatic continuous deployment from `DangAnhTuong/portfolio`)
- **Official Resume**: Served at `https://www.danganhtuong.dev/Dang_Anh_Tuong_CV.pdf` and stored in `public/Dang_Anh_Tuong_CV.pdf` and `Dang_Anh_Tuong_CV.tex`.

## 2. Flagship Project & Repository Privacy Strategy
- **#1 Flagship Project**: **Tường Tận TOEIC (`tuong_tan_toeic`)**
  - **Live Demo**: `https://toeic.danganhtuong.dev` (Production system on Ubuntu Linux VPS, Nginx Reverse Proxy, Let's Encrypt SSL).
  - **GitHub Repo**: `https://github.com/DangAnhTuong/tuong_tan_toeic` (Configured as **Private**).
  - **Pedagogy & IP Protection Strategy**: 
    - The repository is kept **Private** to protect proprietary ETS test bank assets, audio CDN resources, and copyrighted explanation data.
    - On CV and Portfolio, the link is explicitly styled as: `Live Demo | GitHub (Private)`.
    - In the portfolio modal description: *"Mã nguồn đang ở chế độ Private để bảo vệ tài nguyên đề thi ETS. Sẵn sàng cấp quyền Collaborator / Viewer cho Nhà tuyển dụng quan tâm."*
    - Demonstrates high security awareness, IP compliance, and verified code authenticity without exposing commercial test data.

## 3. The 3 Featured Projects Structure
1. **Tuong Tan TOEIC – 4-Skill EdTech Platform (Jan. 2026 – Present)**
   - *Role*: Full-Stack Developer | Production Flagship Project
   - *Links*: `Live Demo` (`toeic.danganhtuong.dev`) | `GitHub (Private)`
   - *Core Metrics*: 18,200 ETS practice questions, 11,785 dictation audio sentences with character-level diffing, 83 SM-2 spaced repetition modules, 100vh single-frame ETS exam simulator, automated mistake review notebook, Google 1-Click OAuth 2.0, automated VietQR payment webhooks, 5-step CI/CD on Linux VPS.
2. **AI-Powered English Learning Platform (Jan. 2026 – Present)**
   - *Role*: Full-Stack Developer | Personal Project
   - *Links*: `Live Demo` (`english.danganhtuong.dev`) | `GitHub`
   - *Core Metrics*: Decoupled backend (Node.js Express + Python FastAPI), Deepgram STT + OpenAI API via WebSockets for real-time pronunciation scoring (<1.5s), JWT refresh token rotation, Google OAuth2 RBAC, Docker Compose, Nginx.
3. **Tuong Hotel – 3D Showcase & Reservation System (June 2025 – Aug. 2025)**
   - *Role*: Frontend Developer | Personal Project
   - *Links*: `Live Demo` (`tuong-hotel.vercel.app`) | `GitHub`
   - *Core Metrics*: Three.js WebGL (@react-three/fiber), 60 FPS luxury room showcases, dining & tour booking flows, Ant Design 5, i18next English/Vietnamese, glTF/Draco 3D asset compression, continuous deployment on Netlify.

## 4. LaTeX CV Technical Specifications (Jake's Resume 1-Page Layout)
- **Base Class**: `\documentclass[letterpaper,10pt]{article}`
- **Page Constraints**: Strictly **1 Page (1 / 1)** with zero vertical overflow.
- **Margins**:
  - `\addtolength{\oddsidemargin}{-0.5in}`
  - `\addtolength{\textwidth}{1.0in}`
  - `\addtolength{\topmargin}{-0.6in}`
  - `\addtolength{\textheight}{1.2in}`
- **Tone & Voice**:
  - Authentic, humble, eager to learn from senior engineers through rigorous code reviews.
  - Transparent candidate identity: Final-year IT student at Thuyloi University (HCMC).
  - 100% clean ASCII characters in LaTeX source (no raw Vietnamese diacritics in pdflatex body).
  - Skills categorized: Frontend, Backend, Programming Languages (including C++, Java, Python, JavaScript, TypeScript, SQL), Database, AI-Assisted Engineering (Cursor, Claude Code, Google Antigravity, Prompt Engineering), DevOps & Cloud, Software Practices, Languages (English CEFR B1 Certified).

## 5. Storage & Synchronization Locations
- `A:\frontend\portfolio\Dang_Anh_Tuong_CV.tex` (Primary LaTeX source)
- `A:\frontend\portfolio\public\Dang_Anh_Tuong_CV.tex` (Public downloadable TeX)
- `A:\frontend\portfolio\public\Dang_Anh_Tuong_CV.pdf` (Active PDF served on website)
- `A:\frontend\portfolio\Dang_Anh_Tuong_CV.pdf` (Root backup)
- `A:\frontend\tuong_tan_toeic\Dang_Anh_Tuong_CV.pdf` (Project repository backup)
- Overleaf Project: `Jake's Resume (1)` (`https://www.overleaf.com/project/6a90004f1b0d5d0810bac67d`)
