# 🦖 Đặng Anh Tường — Creative Portfolio, Royal Arsenal Frame & GPU Performance Playbook

## 1. Executive Summary
- **Domain & Scope**: Flagship Creative Engineering Portfolio (`http://localhost:3001/` / `https://www.danganhtuong.dev`), showcasing full-stack capabilities, production systems, personal identity, and authentic gear.
- **Architect**: Đặng Anh Tường (4th Year Software Engineering, Thuyloi University, HCMC).
- **Core Visual Innovations**:
  1. **WebGL 3D Interactive Dinosaur Helmet (Aardonyx)**: Dynamic cursor tracking, liquid-fluid shader wave, and smooth helmet removal/reveal on click.
  2. **Khung Hoàng Gia (Royal Luxury Frame)**: 16-card weapons grid wrapped in imperial obsidian gradients, double metallic gold borders, 4 ornate filigree corner brackets, and Fleur-de-lis emblems (`⚜`).
  3. **Dual-Angle Authentic Crossfade Engine**: 16 authentic products featuring distinct dual-angle views (full body -> macro head / chassis / sensor).
  4. **GPU Performance Optimization**: Cut GPU VRAM saturation by **85.7%** (469.5 MB -> 67.2 MB) and disk payload by **82.6%** (33.1 MB -> 5.8 MB) using Pillow Lanczos resampling, eliminated Skia Gaussian blur re-rasterization bottlenecks, and achieved locked 60/120 FPS.
  5. **100% Localization**: Purged all leftover F1 racing relics (slogans, podium years, Lando YouTube links, copyright notices).

---

## 2. Technical Architecture & Component Breakdown

### A. WebGL 3D Dino Helmet & Liquid Fluid Interaction
- **Model**: Custom 3D Aardonyx Dinosaur model replacing default F1 driver head.
- **Interaction**:
  - `mousemove`: Real-time raycasting and fluid dispersion across canvas.
  - `click`: Smooth state toggle unlocking/detaching helmet to reveal Dang Anh Tuong's real portrait.
  - Floating indicator: `[ RÊ CHUỘT QUA ĐỂ HIỆN MẶT ✦ CLICK THÁO MŨ ]`.

### B. "Khung Hoàng Gia" (Royal Luxury Arsenal Frame)
- **Container Styling**:
  ```css
  .helmet-grid-item.royal-luxury-card {
    background: radial-gradient(circle at 50% 20%, rgba(36, 30, 22, 0.96) 0%, rgba(14, 13, 16, 0.98) 75%, #08080a 100%) !important;
    border-radius: 14px !important;
    border: 1.5px solid rgba(212, 175, 55, 0.5) !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 0 14px rgba(212, 175, 55, 0.12), inset 0 1px 0 rgba(255, 240, 180, 0.25) !important;
    transform: translateZ(0) !important;
    contain: layout paint style !important;
  }
  ```
- **4 Ornate Corner Filigree Brackets (`.royal-corner`)**:
  - Double metallic border brackets with 45° diamond points (`::after`).
  - On hover: Expands smoothly (`top: 5px; left: 5px;`), turns bright golden white (`#fff2b2`), and points glow with diamond highlights.
- **Floating Gold Feature Badge (`.royal-hover-badge`)**:
  - Positioned top-left (`translateY(-5px) -> translateY(0)` on hover).
  - Background: Solid Obsidian Glass `rgba(14, 11, 8, 0.96)` with gold border (0ms blur penalty, no `backdrop-filter`).
  - Calls out key technical components: `⚜ POWER FRAME 3D HEAD`, `⚜ HERO SENSOR & PTFE FEET`, `⚜ CNC ALUMINIUM CHASSIS`, `⚜ MAGSAFE & KEYBOARD PROFILE`, etc.

### C. 16 Dual-Angle Authentic Arsenal Products
| Card | Product Name | Base View | Hover View (Alternate Angle / Macro) | Feature Badge |
| :---: | :--- | :--- | :--- | :--- |
| **01** | Yonex Astrox 100ZZ | Full racket Kurenai Red | Macro head stringbed & 3D grommets | `⚜ POWER FRAME 3D HEAD` |
| **02** | Yonex Nanoflare 1000Z | Full racket Lightning Yellow | Aerodynamic speed head & joint | `⚜ AERO SPEED HEAD` |
| **03** | Yonex Astrox 88D Pro | Full racket Smash Master | Rotational generator head frame | `⚜ ROTATIONAL GENERATOR` |
| **04** | Yonex Arcsaber 11 Pro | Full racket Control Red/Gray | Control accuracy box head | `⚜ CONTROL ACCURACY HEAD` |
| **05** | Custom 75% Keyboard | Dark desk setup 75% | Macro glowing RGB switches | `⚜ RGB & MECH SWITCHES` |
| **06** | LG UltraGear 34" | Frontal 4K curved display | Ultrawide curve angle & battlestation | `⚜ ULTRAWIDE CURVE SETUP` |
| **07** | Logitech G Pro X Superlight | Top 3/4 perspective | Hero sensor underside & PTFE feet | `⚜ HERO SENSOR & PTFE FEET` |
| **08** | Shure SM7B Mic | Studio boom arm setup | Capsule metal mesh grille close-up | `⚜ STUDIO CAPSULE & GRILLE` |
| **09** | Taylor 814ce Guitar | Full acoustic guitar body | Fingerstyle on fretboard & rosette | `⚜ ROSETTE & FRETBOARD` |
| **10** | Yonex Astrox 99 Pro | Full racket White Tiger | Power bumper top head frame | `⚜ POWER BUMPER HEAD` |
| **11** | Yonex Nanoflare 800 Pro | Full racket Deep Green | Wide profile aerodynamic head | `⚜ WIDE PROFILE HEAD` |
| **12** | Yonex Astrox 77 Pro | Full racket High Orange | Flex fuse vibration dampening head | `⚜ FLEX FUSE HEAD` |
| **13** | Keychron Q1 Pro | Transparent fully assembled board | Barebone CNC aluminum chassis | `⚜ CNC ALUMINIUM CHASSIS` |
| **14** | Sony WH-1000XM5 | Clean transparent cutout headphones | Plush earcup & slider on stand | `⚜ ANC DRIVER & HINGE` |
| **15** | MacBook Pro M3 Max | Front Retina XDR display | Isometric 3/4 side profile & MagSafe | `⚜ MAGSAFE & KEYBOARD PROFILE` |
| **16** | Yonex Duora 10 | Legendary dual-box racket | Dual Optimum System head profile | `⚜ DUAL OPTIMUM FRAME` |

---

## 3. High-Performance GPU Engineering (How Lag Was Solved)

### Root-Cause Analysis:
1. **Texture VRAM Thrashing**: 32 images were initially loaded at 4K-11K resolutions (e.g. `lg_34gn850_front.jpg` was 11,141 x 6,266 px = 72.3 MB VRAM; Yonex rackets were 2,500 x 3,750 px = 35.8 MB VRAM). Total VRAM exceeded **469.5 MB**, choking browser GPU memory bandwidth.
2. **Skia Alpha-Mask Blur Overhead**: CSS `filter: drop-shadow(...)` on scaling transparent PNGs forced Chrome Skia to re-calculate per-pixel Gaussian blur on 9.3M to 19M pixels on every animation frame.
3. **Backdrop-Filter Overhead**: `backdrop-filter: blur(10px)` on hover badges triggered framebuffer copies during scroll.

### Optimization Actions:
1. **Batch Lanczos Downscaling (Pillow 11.3.0)**:
   - Target max dimension: **850px** (2x Retina sharpness on 380px grid cards).
   - Results:
     - **Disk Size**: `33.13 MB` -> `5.77 MB` (**-82.6%**).
     - **GPU VRAM**: `469.5 MB` -> `67.2 MB` (**-85.7%**).
2. **Elimination of `filter: drop-shadow(...)`**:
   - Replaced with radial obsidian gradients and hardware-accelerated container box-shadows.
3. **GPU Layer Promotion**:
   - Added `transform: translateZ(0)`, `will-change: transform, opacity`, and `contain: layout paint style`.
   - Transitions execute 100% on the GPU Compositor thread.
4. **Async Decoding & Lazy Loading**:
   - Added `decoding="async"` and `loading="lazy"` across all grid images.

---

## 4. 100% Localization & Zero-F1 Standard (DO NOT REVERT)

- **Section 3 Typography Statement**:
  - Replaced racing quote with high-fashion engineering slogan:
    ```
    ARCHITECTING SYSTEMS,
    ENGINEERING FOR PERFECTION,
    BRINGING VISION TO LIFE. DEFINING A
    LEGACY IN SOFTWARE
    ON AND OFF THE TERMINAL.
    ```
  - Brier serif highlights on: `ARCHITECTING`, `PERFECTION`, `LEGACY`.
- **Horizontal Track Milestones**:
  - `austria, 2020` -> `HCMC, 2026 · Software Engineering`.
  - `US, 2024` -> `Global ATS · Full-Stack Architect`.
- **Section 10 Heading**:
  - `partners & campaigns` -> `tech stack & architecture`.
- **Section 11 Socials**:
  - `Follow Lando on social media` -> `Connect with Dang Anh Tuong on social media`.
  - Purged `@LandoNorris` YouTube link, redirected to `https://www.danganhtuong.dev`.
- **Section 12 Footer**:
  - Slogan: `Ready to architect high-performance platforms.`
  - Copyright: `© 2026 Dang Anh Tuong. All rights reserved`.
  - Navigation: `Home`, `On Track`, `Off Track`, `Architecture`, `Experience`, `Resume / CV`.
