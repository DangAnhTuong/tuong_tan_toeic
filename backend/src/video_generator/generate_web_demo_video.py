import os
import asyncio
import subprocess
from playwright.async_api import async_playwright
import edge_tts

OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_web_demo_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# 6 Demo Scenes with Fast, Concise Voiceover (rate="+18%")
SCENES = [
    {
        "id": "scene_01",
        "url": "http://localhost:3000/hub",
        "script": "Chào mừng các bạn đến với Tường Tận TOEIC! Tại bảng điều khiển trung tâm, bạn có thể dễ dàng theo dõi mục tiêu học tập mỗi ngày, chuỗi Ngày Học Liên Tiếp Streak và thanh cấp độ kinh nghiệm XP giúp bạn luôn duy trì động lực cao nhất.",
        "action": "dashboard"
    },
    {
        "id": "scene_02",
        "url": "http://localhost:3000/vocabulary",
        "script": "Tiếp theo là Mô-đun Từ Vựng thông minh với hơn 83 Chủ đề chuẩn ETS và hơn 3.500 từ vựng thực tế. Bạn có thể chọn bất kỳ chủ đề nào để bắt đầu học ngay lập tức.",
        "action": "vocab_list"
    },
    {
        "id": "scene_03",
        "url": "http://localhost:3000/vocabulary/learn/1",
        "script": "Trong phòng học từ, bạn được trải nghiệm Flashcard chuẩn Dark Cyber: bấm để lật xem phiên âm, nghĩa tiếng Việt, ví dụ câu và chấm độ nhớ theo thuật toán ngắt quãng SM-2.",
        "action": "flashcard"
    },
    {
        "id": "scene_04",
        "url": "http://localhost:3000/listen/dictation",
        "script": "Tại Mô-đun Luyện Nghe, bạn có thể chọn chế độ Nghe Chép Chính Tả với hơn 11.000 câu hỏi ETS. Hệ thống hỗ trợ 3 chế độ: Điền chỗ trống, Chép cả câu và Shadowing nhại giọng AI.",
        "action": "dictation"
    },
    {
        "id": "scene_05",
        "url": "http://localhost:3000/tests",
        "script": "Đặc biệt, hệ thống cung cấp 91 Bộ đề thi thử ETS chuẩn 200 câu với giao diện phòng thi chuẩn IIG, đồng hồ đếm ngược và dự đoán điểm số TOEIC 990 chính xác.",
        "action": "mock_tests"
    },
    {
        "id": "scene_06",
        "url": "http://localhost:3000/video",
        "script": "Bây giờ, các bạn hãy bắt đầu khám phá các tính năng và trải nghiệm lộ trình luyện thi 4 kỹ năng ngay trên Tường Tận TOEIC nhé!",
        "action": "summary"
    }
]

# Cursor Injection script
CURSOR_SCRIPT = """
(function() {
    if (document.getElementById('playwright-custom-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'playwright-custom-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(56, 189, 248, 0.7)';
    cursor.style.border = '2px solid #ffffff';
    cursor.style.boxShadow = '0 0 15px #38bdf8, 0 0 25px rgba(56,189,248,0.5)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '99999999';
    cursor.style.transition = 'transform 0.05s ease, background-color 0.15s ease';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.left = '960px';
    cursor.style.top = '540px';
    document.body.appendChild(cursor);

    window.__moveCursor = function(x, y) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';
    };

    window.__clickCursor = function() {
        cursor.style.transform = 'translate(-50%, -50%) scale(0.6)';
        cursor.style.backgroundColor = '#fbbf24';
        setTimeout(() => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.backgroundColor = 'rgba(56, 189, 248, 0.7)';
        }, 200);
    };

    document.addEventListener('mousemove', (e) => {
        window.__moveCursor(e.clientX, e.clientY);
    });
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
    await page.evaluate("window.__clickCursor && window.__clickCursor()")
    await page.mouse.click(x, y)
    await asyncio.sleep(0.3)

async def record_scene_actions(page, scene_id, action_name, audio_duration):
    # Ensure cursor script is injected
    await page.evaluate(CURSOR_SCRIPT)
    await asyncio.sleep(0.5)

    if action_name == "dashboard":
        # Hover Streak & Goal
        await smooth_mouse_move(page, 960, 540, 400, 260)
        await asyncio.sleep(1.0)
        await smooth_mouse_move(page, 400, 260, 850, 260)
        await asyncio.sleep(1.2)
        await smooth_mouse_move(page, 850, 260, 1350, 260)
        await asyncio.sleep(1.0)
        # Scroll down smoothly
        await page.evaluate("window.scrollBy({ top: 350, behavior: 'smooth' })")
        await asyncio.sleep(1.5)
        await page.evaluate("window.scrollBy({ top: -350, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

    elif action_name == "vocab_list":
        # Browse topics
        await smooth_mouse_move(page, 960, 540, 600, 320)
        await asyncio.sleep(0.8)
        await page.evaluate("window.scrollBy({ top: 300, behavior: 'smooth' })")
        await asyncio.sleep(1.2)
        await smooth_mouse_move(page, 600, 320, 1000, 450)
        await asyncio.sleep(1.0)
        await page.evaluate("window.scrollBy({ top: -300, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

    elif action_name == "flashcard":
        # Flip flashcard
        await smooth_mouse_move(page, 960, 540, 960, 480)
        await simulate_click(page, 960, 480)
        await asyncio.sleep(1.5)
        # Click flip again
        await simulate_click(page, 960, 480)
        await asyncio.sleep(1.2)
        # Click memory button
        await smooth_mouse_move(page, 960, 480, 1100, 680)
        await simulate_click(page, 1100, 680)
        await asyncio.sleep(1.0)

    elif action_name == "dictation":
        # Browse dictation list
        await smooth_mouse_move(page, 960, 540, 500, 300)
        await asyncio.sleep(1.0)
        await page.evaluate("window.scrollBy({ top: 300, behavior: 'smooth' })")
        await asyncio.sleep(1.2)
        await page.evaluate("window.scrollBy({ top: -300, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

    elif action_name == "mock_tests":
        # Browse tests list
        await smooth_mouse_move(page, 960, 540, 650, 280)
        await asyncio.sleep(1.0)
        await page.evaluate("window.scrollBy({ top: 300, behavior: 'smooth' })")
        await asyncio.sleep(1.2)
        await page.evaluate("window.scrollBy({ top: -300, behavior: 'smooth' })")
        await asyncio.sleep(1.0)

    elif action_name == "summary":
        await smooth_mouse_move(page, 960, 540, 960, 350)
        await asyncio.sleep(1.5)

    # Fill remaining time to match audio duration
    await asyncio.sleep(max(0.5, audio_duration - 5.0))

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
        return 6.0

async def generate_web_demo_video():
    print("=== Step 1: Generating Edge-TTS Voiceovers (Rate +18%) ===")
    audio_durations = []
    for idx, scene in enumerate(SCENES):
        audio_file = os.path.join(TEMP_DIR, f"demo_audio_{idx+1:02d}.mp3")
        txt_tmp = os.path.join(TEMP_DIR, f"demo_script_{idx+1:02d}.txt")
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
            success = False
            for attempt in range(5):
                try:
                    subprocess.run(tts_cmd, check=True)
                    if os.path.exists(audio_file) and os.path.getsize(audio_file) > 1000:
                        success = True
                        break
                except Exception as e:
                    print(f"Retry TTS {attempt+1}/5 on scene {idx+1}: {e}")
                    await asyncio.sleep(1.5)
            if not success:
                raise RuntimeError(f"Could not generate audio for scene {idx+1}")

        dur = get_audio_duration(audio_file)
        audio_durations.append(dur)
        print(f"Voiceover {idx+1}/{len(SCENES)}: Duration {dur:.2f}s")

    print("=== Step 2: Recording Real Web Screen via Playwright ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for idx, scene in enumerate(SCENES):
            part_num = f"{idx+1:02d}"
            video_dir = os.path.join(TEMP_DIR, f"rec_{part_num}")
            os.makedirs(video_dir, exist_ok=True)
            
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                record_video_dir=video_dir,
                record_video_size={"width": 1920, "height": 1080}
            )
            page = await context.new_page()
            
            # Navigate to target page
            try:
                await page.goto(scene["url"], wait_until="networkidle", timeout=15000)
            except:
                await page.goto(scene["url"])
            
            # Record actions
            await record_scene_actions(page, scene["id"], scene["action"], audio_durations[idx])
            
            # Close context to save video
            await context.close()
            
            # Find recorded video file in video_dir
            rec_files = [f for f in os.listdir(video_dir) if f.endswith(".webm")]
            if rec_files:
                raw_rec_path = os.path.join(video_dir, rec_files[0])
                audio_file = os.path.join(TEMP_DIR, f"demo_audio_{part_num}.mp3")
                part_mp4 = os.path.join(TEMP_DIR, f"demo_part_{part_num}.mp4")
                
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
                print(f"Generated Demo Part {part_num}.mp4 with synchronized voiceover!")
        
        await browser.close()

    print("=== Step 3: Concatenating all 6 scenes into final video ===")
    concat_list_path = os.path.join(TEMP_DIR, "demo_concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f_concat:
        for idx in range(len(SCENES)):
            part_num = f"{idx+1:02d}"
            part_mp4 = os.path.join(TEMP_DIR, f"demo_part_{part_num}.mp4")
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
    print(f"SUCCESS! Web Guide Demo Video generated at: {final_output}")

if __name__ == "__main__":
    asyncio.run(generate_web_demo_video())
