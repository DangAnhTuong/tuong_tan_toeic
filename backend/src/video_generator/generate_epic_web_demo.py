import os
import asyncio
import subprocess
from playwright.async_api import async_playwright

OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_epic_demo_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# 8 Rich Detailed Scenes (~3.5 minutes total)
EPIC_SCENES = [
    {
        "id": "scene_01_hub",
        "title": "Bảng Điều Khiển Trung Tâm & Lộ Trình 4 Kỹ Năng",
        "url": "http://localhost:3000/hub",
        "script": "Chào mừng các bạn đến với Tường Tận TOEIC! Tại Bảng điều khiển Trung tâm, hệ thống giúp bạn theo dõi sát sao tiến độ học tập: từ Mục tiêu số phút mỗi ngày, chuỗi Ngày Học Liên Tiếp Streak, thanh Cấp độ Kinh nghiệm XP, đến Lộ trình 4 Kỹ năng Nghe, Đọc, Nói, Viết và Widget Ôn tập ngắt quãng Spaced Repetition ghim vĩnh viễn.",
        "action": "action_hub"
    },
    {
        "id": "scene_02_vocab_dashboard",
        "title": "Kho 83 Chủ Đề Từ Vựng Chuẩn ETS",
        "url": "http://localhost:3000/vocabulary",
        "script": "Tiếp theo là Kho Từ Vựng thông minh với hơn 83 Chủ đề chuẩn Đậu TOEIC chứa hơn 3.500 từ vựng thật. Bạn có thể tìm kiếm theo từ khóa hoặc lọc theo 7 Part của bài thi để chọn chủ đề muốn học.",
        "action": "action_vocab_dashboard"
    },
    {
        "id": "scene_03_flashcard_sm2",
        "title": "Phòng Học Flashcard 3D & Thuật Toán SM-2",
        "url": "http://localhost:3000/vocabulary/learn/6a8fb78d67084670a9918bab",
        "script": "Trong phòng học từ, bạn được trải nghiệm Flashcard 3D nền tối Dark Cyber êm mắt: Bấm để lật thẻ xem phiên âm UK/US, nghĩa tiếng Việt, câu ví dụ thực tế và phát âm chuẩn bản xứ. Sau đó, bấm chọn mức độ ghi nhớ để thuật toán Spaced Repetition SM-2 tự động lên lịch nhắc nhở ôn tập chống quên.",
        "action": "action_flashcard"
    },
    {
        "id": "scene_04_vocab_quiz",
        "title": "Chế Độ Trắc Nghiệm & Luyện Gõ Từ Nhanh",
        "url": "http://localhost:3000/vocabulary/learn/6a8fb78d67084670a9918bab",
        "script": "Không chỉ học Flashcard, bạn có thể chuyển sang chế độ Trắc nghiệm 4 đáp án và Chế độ Gõ từ nhanh để rèn luyện khả năng phản xạ và ghi nhớ mặt chữ chính xác 100%.",
        "action": "action_quiz"
    },
    {
        "id": "scene_05_dictation",
        "title": "Mô-đun Nghe Chép Chính Tả 11.000 Câu",
        "url": "http://localhost:3000/listen/dictation",
        "script": "Tại Mô-đun Luyện Nghe Chép Chính Tả với kho hơn 11.000 câu hỏi ETS từ 2023 đến 2026, bạn có thể chọn 3 chế độ thông minh: Điền chỗ trống, Chép cả câu so sánh sai khác, và Shadowing nhại giọng AI theo dạng sóng âm chuyên nghiệp.",
        "action": "action_dictation"
    },
    {
        "id": "scene_06_listening_passage",
        "title": "Phòng Luyện Nghe Part 3 & 4 Đoạn Văn",
        "url": "http://localhost:3000/listen/level-practice?part=3&level=1",
        "script": "Ở phòng Luyện Nghe theo Cấp độ Part 3 và Part 4, hệ thống sử dụng Chế độ Đoạn văn độc quyền: Một file audio duy nhất điều khiển cụm 3 câu hỏi hiển thị dọc, đi kèm ma trận nhóm 300 câu và tính năng dịch câu hỏi tự động.",
        "action": "action_listening_passage"
    },
    {
        "id": "scene_07_reading_practice",
        "title": "Phòng Luyện Đọc & Ngữ Pháp 2 Cột",
        "url": "http://localhost:3000/read/practice/6a8e69a8d3fb5cf5d58ea1cd",
        "script": "Đối với kỹ năng Đọc hiểu, phòng làm bài 2 cột tối ưu tuyệt đối: Văn bản bài đọc hiển thị sắc nét bên trái, câu hỏi và đáp án bên phải, hỗ trợ tra từ điển bôi đen trực tiếp và hiển thị lời giải chi tiết ngay khi chọn đáp án.",
        "action": "action_reading_practice"
    },
    {
        "id": "scene_08_mock_test",
        "title": "Phòng Thi Thử ETS Full 200 Câu 120 Phút",
        "url": "http://localhost:3000/tests/room/6a91b92f6d1938ebacd999fb",
        "script": "Cuối cùng là Hệ thống 91 Bộ Đề Thi Thử Full 200 câu chuẩn IIG Quốc Tế: Đồng hồ đếm ngược 120 phút, Bubble sheet 200 câu, dự đoán điểm số TOEIC 990 và xuất báo cáo kết quả chi tiết. Chúc các bạn học tập bứt phá cùng Tường Tận TOEIC!",
        "action": "action_mock_test"
    }
]

# Advanced Injected Script with Smooth Zoom, Neon Highlights & Cursor
INJECTED_HELPER_SCRIPT = """
(function() {
    // 1. Inject Styles for Zoom container and Cursor
    if (!document.getElementById('demo-enhancer-styles')) {
        const style = document.createElement('style');
        style.id = 'demo-enhancer-styles';
        style.innerHTML = `
            #demo-cursor {
                position: fixed;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(56,189,248,0.9) 0%, rgba(14,165,233,0.5) 70%, transparent 100%);
                border: 2px solid #ffffff;
                box-shadow: 0 0 18px #38bdf8, 0 0 35px rgba(56,189,248,0.6);
                pointer-events: none;
                z-index: 99999999;
                transform: translate(-50%, -50%);
                transition: transform 0.05s ease, background-color 0.15s ease;
                left: 960px;
                top: 540px;
            }
            .demo-ripple {
                position: fixed;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 3px solid #38bdf8;
                background: rgba(56,189,248,0.25);
                pointer-events: none;
                z-index: 99999998;
                transform: translate(-50%, -50%) scale(0.2);
                animation: demoRippleAnim 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            }
            @keyframes demoRippleAnim {
                0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
            }
            .demo-neon-glow {
                box-shadow: 0 0 0 4px #38bdf8, 0 0 30px rgba(56,189,248,0.8) !important;
                border-color: #38bdf8 !important;
                transition: all 0.4s ease !important;
            }
            #root, main {
                transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1) !important;
                transform-origin: center center;
            }
        `;
        document.head.appendChild(style);
    }

    // 2. Cursor element
    if (!document.getElementById('demo-cursor')) {
        const c = document.createElement('div');
        c.id = 'demo-cursor';
        document.body.appendChild(c);
    }

    window.__moveCursor = function(x, y) {
        const c = document.getElementById('demo-cursor');
        if (c) {
            c.style.left = x + 'px';
            c.style.top = y + 'px';
        }
    };

    window.__clickCursor = function(x, y) {
        const c = document.getElementById('demo-cursor');
        if (c) {
            c.style.transform = 'translate(-50%, -50%) scale(0.65)';
            c.style.backgroundColor = 'rgba(251, 191, 36, 0.9)';
            setTimeout(() => {
                c.style.transform = 'translate(-50%, -50%) scale(1)';
                c.style.backgroundColor = 'rgba(56, 189, 248, 0.9)';
            }, 220);
        }
        // Spawn ripple
        const rip = document.createElement('div');
        rip.className = 'demo-ripple';
        rip.style.left = x + 'px';
        rip.style.top = y + 'px';
        document.body.appendChild(rip);
        setTimeout(() => rip.remove(), 700);
    };

    // 3. Zoom-in Camera Function
    window.__zoomCamera = function(originX, originY, scale = 1.35) {
        const target = document.querySelector('main') || document.getElementById('root');
        if (target) {
            target.style.transformOrigin = `${originX}px ${originY}px`;
            target.style.transform = `scale(${scale})`;
        }
    };

    window.__resetCamera = function() {
        const target = document.querySelector('main') || document.getElementById('root');
        if (target) {
            target.style.transform = 'scale(1)';
        }
    };

    // 4. Set Demo User in LocalStorage
    try {
        localStorage.setItem('tuong_tan_toeic_jwt_token', 'demo_active_token_2026');
        localStorage.setItem('tuong_tan_toeic_user', JSON.stringify({
            _id: '6a8e5bdb7e4d19f55c51d1a1',
            fullName: 'Đặng Anh Tường',
            email: 'danganhtuong@gmail.com',
            isLoggedIn: true,
            role: 'VIP',
            streak: 7,
            xp: 480,
            dailyGoalMinutes: 30
        }));
    } catch(e) {}
})();
"""

async def smooth_mouse_move(page, start_x, start_y, end_x, end_y, steps=25, delay=0.015):
    for i in range(1, steps + 1):
        curr_x = start_x + (end_x - start_x) * (i / steps)
        curr_y = start_y + (end_y - start_y) * (i / steps)
        await page.mouse.move(curr_x, curr_y)
        await page.evaluate(f"window.__moveCursor && window.__moveCursor({curr_x}, {curr_y})")
        await asyncio.sleep(delay)

async def simulate_click(page, x, y):
    await page.evaluate(f"window.__clickCursor && window.__clickCursor({x}, {y})")
    await page.mouse.click(x, y)
    await asyncio.sleep(0.35)

async def execute_scene_action(page, action_name, target_duration):
    await page.evaluate(INJECTED_HELPER_SCRIPT)
    await asyncio.sleep(0.6)

    if action_name == "action_hub":
        # 1. Hover Streak & Daily Goal
        await smooth_mouse_move(page, 960, 540, 480, 280)
        # Zoom in on Goal Widget
        await page.evaluate("window.__zoomCamera(480, 280, 1.35)")
        await asyncio.sleep(1.8)
        # Move to Streak widget
        await smooth_mouse_move(page, 480, 280, 960, 280)
        await page.evaluate("window.__zoomCamera(960, 280, 1.35)")
        await asyncio.sleep(1.8)
        # Reset zoom and scroll down
        await page.evaluate("window.__resetCamera()")
        await asyncio.sleep(0.8)
        await smooth_mouse_move(page, 960, 280, 960, 600)
        await page.evaluate("window.scrollBy({ top: 400, behavior: 'smooth' })")
        await asyncio.sleep(2.0)
        await page.evaluate("window.scrollBy({ top: -400, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

    elif action_name == "action_vocab_dashboard":
        # Search for contract
        await smooth_mouse_move(page, 960, 540, 750, 280)
        # Zoom on search input
        await page.evaluate("window.__zoomCamera(750, 280, 1.3)")
        await simulate_click(page, 750, 280)
        await page.keyboard.type("contract", delay=80)
        await asyncio.sleep(1.5)
        await page.evaluate("window.__resetCamera()")
        await asyncio.sleep(0.8)
        # Hover the Contracts Topic Card
        await smooth_mouse_move(page, 750, 280, 550, 520)
        await page.evaluate("window.__zoomCamera(550, 520, 1.4)")
        await asyncio.sleep(1.8)
        await simulate_click(page, 550, 520)
        await asyncio.sleep(1.5)
        await page.evaluate("window.__resetCamera()")

    elif action_name == "action_flashcard":
        # Wait for flashcard to mount
        await asyncio.sleep(1.2)
        # Move to Flashcard & Zoom in
        await smooth_mouse_move(page, 960, 540, 960, 480)
        await page.evaluate("window.__zoomCamera(960, 480, 1.4)")
        await asyncio.sleep(1.2)
        # Click flip card
        await simulate_click(page, 960, 480)
        await asyncio.sleep(2.0)
        # Click audio pronunciation button
        await smooth_mouse_move(page, 960, 480, 880, 360)
        await simulate_click(page, 880, 360)
        await asyncio.sleep(1.5)
        # Click flip back
        await smooth_mouse_move(page, 880, 360, 960, 480)
        await simulate_click(page, 960, 480)
        await asyncio.sleep(1.2)
        # Click Good (SM-2 rating)
        await smooth_mouse_move(page, 960, 480, 1080, 720)
        await simulate_click(page, 1080, 720)
        await asyncio.sleep(1.5)
        await page.evaluate("window.__resetCamera()")

    elif action_name == "action_quiz":
        await asyncio.sleep(1.0)
        # Switch to Quiz / Practice Step
        await smooth_mouse_move(page, 960, 540, 960, 230)
        await simulate_click(page, 960, 230) # Select Quiz Tab
        await asyncio.sleep(1.2)
        # Zoom in on Question
        await page.evaluate("window.__zoomCamera(960, 460, 1.35)")
        await smooth_mouse_move(page, 960, 230, 800, 520)
        await simulate_click(page, 800, 520)
        await asyncio.sleep(2.0)
        await page.evaluate("window.__resetCamera()")

    elif action_name == "action_dictation":
        # Browse dictation list
        await smooth_mouse_move(page, 960, 540, 500, 320)
        await page.evaluate("window.__zoomCamera(500, 320, 1.3)")
        await asyncio.sleep(1.5)
        await smooth_mouse_move(page, 500, 320, 960, 320)
        await asyncio.sleep(1.5)
        await page.evaluate("window.__resetCamera()")
        await page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
        await asyncio.sleep(2.0)
        await page.evaluate("window.scrollBy({ top: -350, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

    elif action_name == "action_listening_passage":
        await asyncio.sleep(1.2)
        # Hover Play button & Zoom
        await smooth_mouse_move(page, 960, 540, 350, 350)
        await page.evaluate("window.__zoomCamera(350, 350, 1.35)")
        await simulate_click(page, 350, 350)
        await asyncio.sleep(1.5)
        # Move to Questions 32-34 on the right
        await smooth_mouse_move(page, 350, 350, 1200, 420)
        await page.evaluate("window.__zoomCamera(1200, 420, 1.35)")
        await asyncio.sleep(1.5)
        await simulate_click(page, 1150, 480) # Click option A
        await asyncio.sleep(1.2)
        await simulate_click(page, 1150, 680) # Click option B for Q2
        await asyncio.sleep(1.5)
        await page.evaluate("window.__resetCamera()")

    elif action_name == "action_reading_practice":
        await asyncio.sleep(1.2)
        # Zoom in on Left Passage
        await smooth_mouse_move(page, 960, 540, 500, 450)
        await page.evaluate("window.__zoomCamera(500, 450, 1.35)")
        await asyncio.sleep(1.8)
        # Move to Right Question
        await smooth_mouse_move(page, 500, 450, 1350, 450)
        await page.evaluate("window.__zoomCamera(1350, 450, 1.35)")
        await asyncio.sleep(1.5)
        await simulate_click(page, 1300, 560) # Click option
        await asyncio.sleep(2.0)
        await page.evaluate("window.__resetCamera()")

    elif action_name == "action_mock_test":
        await asyncio.sleep(1.2)
        # Zoom on Timer & Question Matrix
        await smooth_mouse_move(page, 960, 540, 960, 80)
        await page.evaluate("window.__zoomCamera(960, 80, 1.4)")
        await asyncio.sleep(1.8)
        # Zoom on ETS Photograph
        await smooth_mouse_move(page, 960, 80, 500, 450)
        await page.evaluate("window.__zoomCamera(500, 450, 1.35)")
        await asyncio.sleep(1.8)
        # Move to Right Options
        await smooth_mouse_move(page, 500, 450, 1350, 450)
        await page.evaluate("window.__zoomCamera(1350, 450, 1.35)")
        await simulate_click(page, 1300, 420)
        await asyncio.sleep(1.5)
        await page.evaluate("window.__resetCamera()")

    # Match target duration
    await asyncio.sleep(max(0.5, target_duration - 4.0))

def get_audio_duration(audio_path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        audio_path
    ]
    try:
        res = subprocess.check_output(cmd).decode().strip()
        return float(res)
    except:
        return 12.0

async def generate_epic_web_demo():
    print("=== Step 1: Generating 8 Fast Crisp Edge-TTS Voiceovers (Rate +18%) ===")
    audio_durations = []
    for idx, scene in enumerate(EPIC_SCENES):
        audio_file = os.path.join(TEMP_DIR, f"epic_audio_{idx+1:02d}.mp3")
        txt_tmp = os.path.join(TEMP_DIR, f"epic_script_{idx+1:02d}.txt")
        with open(txt_tmp, "w", encoding="utf-8") as ft:
            ft.write(scene["script"])
        
        if not (os.path.exists(audio_file) and os.path.getsize(audio_file) > 1000):
            tts_cmd = [
                "edge-tts",
                "--voice", "vi-VN-NamMinhNeural",
                "--rate", "+18%",
                "-f", txt_tmp,
                "--write-media", audio_file
            ]
            for attempt in range(5):
                try:
                    subprocess.run(tts_cmd, check=True)
                    if os.path.exists(audio_file) and os.path.getsize(audio_file) > 1000:
                        break
                except Exception as e:
                    print(f"TTS Retry {attempt+1}/5 on scene {idx+1}: {e}")
                    await asyncio.sleep(1.5)

        dur = get_audio_duration(audio_file)
        audio_durations.append(dur)
        print(f"Voiceover {idx+1}/{len(EPIC_SCENES)}: Duration {dur:.2f}s ({scene['id']})")

    print("=== Step 2: Recording Real Web Screen with Smooth Camera Zooms ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for idx, scene in enumerate(EPIC_SCENES):
            part_num = f"{idx+1:02d}"
            video_dir = os.path.join(TEMP_DIR, f"rec_epic_{part_num}")
            os.makedirs(video_dir, exist_ok=True)
            
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=video_dir,
                record_video_size={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            
            # Set LocalStorage before goto
            await page.add_init_script("""
                try {
                    localStorage.setItem('tuong_tan_toeic_jwt_token', 'demo_active_token_2026');
                    localStorage.setItem('tuong_tan_toeic_user', JSON.stringify({
                        _id: '6a8e5bdb7e4d19f55c51d1a1',
                        fullName: 'Dang Anh Tuong',
                        email: 'danganhtuong@gmail.com',
                        isLoggedIn: true,
                        role: 'VIP',
                        streak: 7,
                        xp: 480,
                        dailyGoalMinutes: 30
                    }));
                } catch(e) {}
            """)

            # Navigate to target page
            try:
                await page.goto(scene["url"], wait_until="networkidle", timeout=12000)
            except:
                await page.goto(scene["url"])
            
            # Execute animated zoom actions
            await execute_scene_action(page, scene["action"], audio_durations[idx])
            
            # Close context to finish webm file
            await context.close()
            
            # Find recorded video file in video_dir
            rec_files = [f for f in os.listdir(video_dir) if f.endswith(".webm")]
            if rec_files:
                raw_rec_path = os.path.join(video_dir, rec_files[0])
                audio_file = os.path.join(TEMP_DIR, f"epic_audio_{part_num}.mp3")
                part_mp4 = os.path.join(TEMP_DIR, f"epic_part_{part_num}.mp4")
                
                # Merge video + audio with FFmpeg
                merge_cmd = [
                    "ffmpeg", "-y",
                    "-i", raw_rec_path,
                    "-i", audio_file,
                    "-c:v", "libx264", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k",
                    "-shortest",
                    part_mp4
                ]
                subprocess.run(merge_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                print(f"Generated Epic Demo Part {part_num}.mp4: {scene['id']}")
        
        await browser.close()

    print("=== Step 3: Concatenating all 8 Epic Scenes into final video ===")
    concat_list_path = os.path.join(TEMP_DIR, "epic_concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f_concat:
        for idx in range(len(EPIC_SCENES)):
            part_num = f"{idx+1:02d}"
            part_mp4 = os.path.join(TEMP_DIR, f"epic_part_{part_num}.mp4")
            norm_path = part_mp4.replace("\\", "/")
            f_concat.write(f"file '{norm_path}'\n")

    final_output = os.path.join(OUTPUT_DIR, "web_guide_4skills_vocab.mp4")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        final_output
    ]
    subprocess.run(concat_cmd, check=True)
    print(f"SUCCESS! Epic 8-Scene Live Demo Video generated at: {final_output}")

if __name__ == "__main__":
    asyncio.run(generate_epic_web_demo())
