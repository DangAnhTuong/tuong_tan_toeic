import os
import sys
import json
import asyncio
import subprocess
import glob
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')
from PIL import Image, ImageDraw, ImageFont
import numpy as np
import edge_tts

TEMP_BASE = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw\batch"
OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
os.makedirs(TEMP_BASE, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 24000

# Aesthetics
BG_DARK = (10, 15, 29) # #0a0f1d
CARD_BG = (17, 24, 39) # #111827
BORDER_CYAN = (6, 182, 212) # #06b6d4
BORDER_AMBER = (245, 158, 11) # #f59e0b
BORDER_GREEN = (16, 185, 129) # #10b981
TEXT_WHITE = (255, 255, 255)
TEXT_CYAN = (103, 232, 249)
TEXT_AMBER = (252, 211, 77)
TEXT_MUTED = (148, 163, 184)

def get_font(size, bold=False):
    font_paths = [
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf" if bold else "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    for p in font_paths:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def clean_speech_text(t):
    # Standardize TOEIC & Part names
    t = re.sub(r'\bbài thi tu\b', 'bài thi TOEIC', t, flags=re.IGNORECASE)
    t = re.sub(r'\bpart five\b', 'Part 5', t, flags=re.IGNORECASE)
    t = re.sub(r'\bvặt năm\b', 'Part 5', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđiện từ\b', 'điền từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\bgóc từ\b', 'gốc từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\btràng từ\b', 'trạng từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\btràng trạng từ\b', 'trạng từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\bhậu tổ\b', 'hậu tố', t, flags=re.IGNORECASE)
    
    # Suffixes
    t = re.sub(r'\bđuôi tion\b', 'đuôi tion (sần)', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi sình\b', 'đuôi tion', t, flags=re.IGNORECASE)
    t = re.sub(r'\bchuẩn sình\b', 'chuẩn là đuôi tion', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi lì\b', 'đuôi ly', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi xì\b', 'đuôi ce', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđôi xỉ\b', 'đuôi ce', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi c\b', 'đuôi ce', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi m\b', 'đuôi ment', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi n\b', 'đuôi ness', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi t\b', 'đuôi ty', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi ur\b', 'đuôi ure', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi error\b', 'đuôi er', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi er i\b', 'đuôi er và đuôi ee', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi ẩn\b', 'đuôi ian', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđôi phủ\b', 'đuôi ful', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi phụ\b', 'đuôi ful', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđôi l\b', 'đuôi less', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđôi old\b', 'đuôi al', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi y phải\b', 'đuôi ify', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđuôi eyes\b', 'đuôi ize', t, flags=re.IGNORECASE)
    
    # Specific English words
    t = re.sub(r'\bcare phụ\b', 'careful', t, flags=re.IGNORECASE)
    t = re.sub(r'\bcareless caress\b', 'careless', t, flags=re.IGNORECASE)
    t = re.sub(r'\bfly attendant\b', 'flight attendant', t, flags=re.IGNORECASE)
    t = re.sub(r'\bweck\b', 'weak', t, flags=re.IGNORECASE)
    t = re.sub(r'\bwecken\b', 'weaken', t, flags=re.IGNORECASE)
    t = re.sub(r'\bmoderniz\b', 'modernize', t, flags=re.IGNORECASE)
    
    t = ' '.join(t.split())
    return t.strip()

def get_audio_duration(path):
    cmd = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        path
    ]
    try:
        res = subprocess.check_output(cmd).decode().strip()
        return float(res)
    except:
        return 0.0

def create_slide_intro(lesson_title, chapter_name, output_path):
    img = Image.new("RGBA", (1920, 1080), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([(20, 20), (1900, 1060)], outline=(30, 41, 59), width=3)
    draw.rectangle([(24, 24), (1896, 1056)], outline=BORDER_CYAN, width=2)
    
    draw.rounded_rectangle([(760, 80), (1160, 135)], radius=15, fill=(15, 23, 42), outline=BORDER_CYAN, width=2)
    draw.text((790, 93), "🎯 TƯỜNG TẬN TOEIC 2026", font=get_font(24, True), fill=TEXT_CYAN)
    
    draw.text((320, 220), chapter_name.upper(), font=get_font(44, True), fill=TEXT_AMBER)
    
    # Title multi-line
    draw.text((240, 310), lesson_title.upper(), font=get_font(38, True), fill=TEXT_WHITE)
    
    draw.rounded_rectangle([(240, 430), (1680, 850)], radius=20, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    
    draw.text((300, 480), "📌 MỤC TIÊU BÀI HỌC:", font=get_font(30, True), fill=TEXT_CYAN)
    draw.text((300, 550), "• Hiểu sâu bản chất và quy tắc nhận diện kiến thức trong đề thi ETS Part 5.", font=get_font(24, False), fill=TEXT_WHITE)
    draw.text((300, 610), "• Nắm vững các dấu hiệu nhận biết nhanh trong 3 - 5 giây không cần dịch hết câu.", font=get_font(24, False), fill=TEXT_WHITE)
    draw.text((300, 670), "• Tránh các bẫy phổ biến và làm 5 câu bài tập thực hành ngay bên dưới video.", font=get_font(24, False), fill=TEXT_WHITE)
    draw.text((300, 730), "• Tích hợp hệ thống ghi nhận điểm thưởng +50 XP sau khi hoàn thành bài học.", font=get_font(24, False), fill=TEXT_AMBER)

    draw.text((680, 990), "⚡ Video Bài Giảng Chuẩn ETS • Lồng Tiếng AI Studio 100%", font=get_font(22, True), fill=TEXT_CYAN)
    img.save(output_path)

def create_slide_topic(lesson_title, topic_text, output_path):
    img = Image.new("RGBA", (1920, 1080), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([(20, 20), (1900, 1060)], outline=(30, 41, 59), width=3)
    draw.rectangle([(24, 24), (1896, 1056)], outline=BORDER_AMBER, width=2)
    
    draw.rounded_rectangle([(720, 70), (1200, 125)], radius=15, fill=(15, 23, 42), outline=BORDER_AMBER, width=2)
    draw.text((750, 83), "🧠 TRỌNG TÂM KIẾN THỨC", font=get_font(24, True), fill=TEXT_AMBER)
    
    draw.rounded_rectangle([(180, 160), (1740, 290)], radius=22, fill=(30, 41, 59), outline=BORDER_AMBER, width=3)
    draw.text((220, 195), f'"{lesson_title}"', font=get_font(42, True), fill=TEXT_AMBER)
    draw.text((450, 250), "🔥 Bí Kíp Xử Lý Câu Hỏi Part 5 Nhanh Chóng & Chuẩn Xác 🔥", font=get_font(24, False), fill=TEXT_CYAN)

    draw.rounded_rectangle([(180, 340), (1740, 880)], radius=20, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    draw.text((240, 400), "💎 CÁC QUY TẮC CẦN GHI NHỚ:", font=get_font(32, True), fill=TEXT_CYAN)
    
    lines = [
        "1. Xác định vị trí từ loại cần điền dựa vào các từ đứng trước và đứng sau chỗ trống.",
        "2. Nhận diện danh từ chính (Head Noun) đứng ở cuối cùng của cụm danh từ (Noun Phrase).",
        "3. Tính từ bổ nghĩa đứng trước danh từ, Trạng từ bổ nghĩa cho Tính từ / Động từ.",
        "4. Danh từ đếm được số ít bắt buộc phải có mạo từ (a, an, the) hoặc từ chỉ định (this, that, my)."
    ]
    for idx, line in enumerate(lines):
        y = 480 + idx * 80
        draw.text((240, y), line, font=get_font(24, False), fill=TEXT_WHITE)

    draw.text((640, 990), "🎯 TƯỜNG TẬN TOEIC • Phương Pháp Ghi Nhớ Ngữ Pháp Nhanh Nhất", font=get_font(22, True), fill=TEXT_CYAN)
    img.save(output_path)

def create_slide_outro(lesson_title, output_path):
    img = Image.new("RGBA", (1920, 1080), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    draw.rectangle([(20, 20), (1900, 1060)], outline=(30, 41, 59), width=3)
    draw.rectangle([(24, 24), (1896, 1056)], outline=BORDER_GREEN, width=2)
    
    draw.rounded_rectangle([(740, 120), (1180, 175)], radius=15, fill=(15, 23, 42), outline=BORDER_GREEN, width=2)
    draw.text((770, 133), "🎉 HOÀN THÀNH BÀI HỌC", font=get_font(24, True), fill=(52, 211, 153))
    
    draw.text((380, 250), "BẠN ĐÃ HOÀN THÀNH XUẤT SẮC BÀI HỌC!", font=get_font(44, True), fill=TEXT_WHITE)
    draw.text((450, 330), "Hãy làm ngay 5 câu trắc nghiệm bên dưới để nhận +50 XP", font=get_font(32, False), fill=TEXT_CYAN)

    draw.rounded_rectangle([(300, 430), (1620, 830)], radius=20, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    
    items = [
        ("🎯 Bước 1: Ôn lại quy tắc", "Đọc lại tóm tắt và ghi chú quan trọng vừa học trong video."),
        ("🔍 Bước 2: Làm bài tập củng cố", "Làm 5 câu hỏi trắc nghiệm ETS tương tác ngay bên dưới video."),
        ("⚡ Bước 3: Xem giải thích chi tiết", "Đọc bản dịch nghĩa và mẹo loại trừ đáp án sai từng câu."),
        ("📝 Bước 4: Tự động lưu vào sổ sai", "Mọi câu làm sai sẽ được hệ thống lưu vào Sổ tay câu sai để ôn lại.")
    ]
    
    for i, (title, desc) in enumerate(items):
        y = 470 + i * 85
        draw.text((360, y), title, font=get_font(26, True), fill=TEXT_AMBER)
        draw.text((750, y + 2), desc, font=get_font(22, False), fill=TEXT_MUTED)

    draw.text((660, 980), "🎯 TƯỜNG TẬN TOEIC — Hệ Thống Luyện Thi TOEIC Toàn Diện", font=get_font(24, True), fill=TEXT_CYAN)
    img.save(output_path)

def create_sidebar_mask(output_path):
    img = Image.new("RGBA", (1920, 1080), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Top-left Logo Cover
    draw.rounded_rectangle([(20, 15), (420, 80)], radius=12, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    draw.text((40, 30), "🎯 TƯỜNG TẬN TOEIC", font=get_font(26, True), fill=TEXT_CYAN)

    # Right Sidebar Mask (x: 1350 to 1920)
    draw.rectangle([(1350, 0), (1920, 1080)], fill=BG_DARK)
    draw.rectangle([(1350, 0), (1354, 1080)], fill=BORDER_CYAN)

    # Card 1: Studio Widget
    draw.rounded_rectangle([(1380, 30), (1890, 140)], radius=14, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    draw.text((1405, 50), "🤖 AI GIẢNG VIÊN STUDIO", font=get_font(22, True), fill=TEXT_CYAN)
    draw.text((1405, 90), "🟢 Đang giảng bài trực tiếp theo slide", font=get_font(18, False), fill=(52, 211, 153))

    # Card 2: Knowledge Card
    draw.rounded_rectangle([(1380, 160), (1890, 680)], radius=14, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    draw.text((1405, 185), "📋 BẢNG TÓM TẮT NGỮ PHÁP", font=get_font(22, True), fill=TEXT_AMBER)
    
    draw.text((1405, 235), "1. Cụm Danh Từ (Noun Phrase):", font=get_font(18, True), fill=TEXT_CYAN)
    draw.text((1405, 265), "• Cấu trúc: Mạo từ + (Trạng từ) + Tính từ + Danh từ", font=get_font(16, False), fill=TEXT_WHITE)
    draw.text((1405, 295), "• Danh từ đứng cuối cùng luôn là Danh từ chính.", font=get_font(16, False), fill=TEXT_MUTED)

    draw.text((1405, 345), "2. Vị trí Danh Từ trong câu:", font=get_font(18, True), fill=TEXT_CYAN)
    draw.text((1405, 375), "• Đứng đầu câu làm Chủ ngữ (Subject)", font=get_font(16, False), fill=TEXT_WHITE)
    draw.text((1405, 405), "• Đứng sau Động từ làm Tân ngữ (Object)", font=get_font(16, False), fill=TEXT_WHITE)
    draw.text((1405, 435), "• Đứng sau Giới từ (in, on, at, for, of, with...)", font=get_font(16, False), fill=TEXT_WHITE)
    draw.text((1405, 465), "• Đứng sau Tính từ sở hữu (my, your, his, her, their)", font=get_font(16, False), fill=TEXT_WHITE)

    draw.text((1405, 515), "3. Mẹo làm bài 3 giây:", font=get_font(18, True), fill=TEXT_AMBER)
    draw.text((1405, 545), "• Nhìn trước & nhìn sau chỗ trống để xác định từ loại.", font=get_font(16, False), fill=TEXT_WHITE)
    draw.text((1405, 575), "• Sau a/an/the + chỗ trống + giới từ -> Chọn Danh từ.", font=get_font(16, False), fill=(52, 211, 153))

    # Card 3: Platform Info
    draw.rounded_rectangle([(1380, 710), (1890, 1020)], radius=14, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    draw.text((1405, 735), "🎯 TƯỜNG TẬN TOEIC 2026", font=get_font(20, True), fill=TEXT_CYAN)
    draw.text((1405, 780), "• 8.164 Câu hỏi ETS 5 Cấp độ", font=get_font(16, False), fill=TEXT_MUTED)
    draw.text((1405, 820), "• 11.785 Câu Nghe chép chính tả", font=get_font(16, False), fill=TEXT_MUTED)
    draw.text((1405, 860), "• 3.500+ Từ vựng Spaced Repetition", font=get_font(16, False), fill=TEXT_MUTED)
    draw.text((1405, 900), "• 91 Bộ đề ETS Full 200 câu", font=get_font(16, False), fill=TEXT_MUTED)
    draw.text((1405, 955), "👉 Làm bài tập ngay bên dưới video!", font=get_font(18, True), fill=TEXT_AMBER)

    img.save(output_path)

async def synthesize_single_sentence(i, s, audio_dir, sem):
    async with sem:
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(audio_dir, f"sent_{block_id}.mp3")
        text = clean_speech_text(s["text"])
        
        if os.path.exists(raw_audio) and os.path.getsize(raw_audio) < 100:
            try: os.remove(raw_audio)
            except: pass

        if not (os.path.exists(raw_audio) and os.path.getsize(raw_audio) >= 100):
            for attempt in range(5):
                try:
                    communicate = edge_tts.Communicate(text, voice="vi-VN-NamMinhNeural", rate="+2%")
                    await asyncio.wait_for(communicate.save(raw_audio), timeout=8.0)
                    if os.path.exists(raw_audio) and os.path.getsize(raw_audio) >= 100:
                        break
                except Exception as e:
                    if os.path.exists(raw_audio) and os.path.getsize(raw_audio) < 100:
                        try: os.remove(raw_audio)
                        except: pass
                    await asyncio.sleep(0.5)
        return i, raw_audio

async def process_single_lesson(lesson_info):
    lesson_id = lesson_info["id"]
    title = lesson_info["title"]
    chapter_name = lesson_info.get("chapter_name", "Làm chủ ngữ pháp trọng tâm Part 5")
    url = lesson_info["url"]
    output_filename = lesson_info["output_filename"]
    
    lesson_dir = os.path.join(TEMP_BASE, lesson_id)
    os.makedirs(lesson_dir, exist_ok=True)
    audio_dir = os.path.join(lesson_dir, "audio")
    os.makedirs(audio_dir, exist_ok=True)
    thumbs_dir = os.path.join(lesson_dir, "thumbs")
    os.makedirs(thumbs_dir, exist_ok=True)
    
    final_output_path = os.path.join(OUTPUT_DIR, output_filename)
    if os.path.exists(final_output_path) and os.path.getsize(final_output_path) > 1000000:
        print(f"[SKIP] Lesson video already rendered and ready: {final_output_path}")
        return
    
    # 1. Download Video & VTT
    raw_video = os.path.join(lesson_dir, "raw_video.mp4")
    raw_vtt = os.path.join(lesson_dir, "raw_video.vi.vtt")
    
    if not os.path.exists(raw_video) or os.path.getsize(raw_video) < 100000:
        print("Downloading 1080p video...")
        cmd_v = [
            "yt-dlp",
            "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]",
            "--merge-output-format", "mp4",
            "-o", raw_video,
            url
        ]
        subprocess.run(cmd_v, check=True)

    if not os.path.exists(raw_vtt) or os.path.getsize(raw_vtt) < 500:
        print("Downloading VTT subtitles...")
        cmd_sub = [
            "yt-dlp",
            "--write-auto-subs",
            "--sub-lang", "vi",
            "--skip-download",
            "-o", os.path.join(lesson_dir, "raw_video.%(ext)s"),
            url
        ]
        subprocess.run(cmd_sub, check=True)

    # 2. Extract Video Duration & Subtitles
    total_duration = get_audio_duration(raw_video)
    total_samples = int(total_duration * SAMPLE_RATE)
    print(f"Video Duration: {total_duration:.2f}s ({total_duration/60:.2f}m)")

    with open(raw_vtt, "r", encoding="utf-8") as f:
        vtt_content = f.read()

    blocks = re.findall(r'(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})[^\n]*\n(.*?)(?=\n\n|\n\d{2}:\d{2}|\Z)', vtt_content, re.DOTALL)
    def parse_t(ts):
        parts = ts.split(':')
        return float(parts[0])*3600 + float(parts[1])*60 + float(parts[2])

    unique_speech_cues = []
    for start_s, end_s, body in blocks:
        lines = [l.strip() for l in body.split('\n') if l.strip()]
        for line in lines:
            if '<c>' in line:
                cleaned = re.sub(r'<[^>]+>', '', line).strip()
                cleaned = ' '.join(cleaned.split())
                if cleaned:
                    unique_speech_cues.append({
                        'start': parse_t(start_s),
                        'end': parse_t(end_s),
                        'text': cleaned
                    })

    # Group into clean sentences
    sentences = []
    curr = None
    for c in unique_speech_cues:
        if not curr:
            curr = {'start': c['start'], 'end': c['end'], 'text': c['text']}
        else:
            gap = c['start'] - curr['end']
            ends_punc = curr['text'].endswith(('.', '?', '!', ' nhá.', ' nha.', ' nhé.', ' á.', ' ạ.'))
            if gap > 0.8 or len(curr['text'].split()) >= 13 or (ends_punc and len(curr['text'].split()) >= 5):
                sentences.append(curr)
                curr = {'start': c['start'], 'end': c['end'], 'text': c['text']}
            else:
                curr['end'] = c['end']
                curr['text'] += ' ' + c['text']
    if curr:
        sentences.append(curr)

    print(f"Extracted {len(sentences)} 100% clean non-repeating sentences!")
    with open(os.path.join(lesson_dir, "clean_sentences.json"), "w", encoding="utf-8") as f:
        json.dump(sentences, f, ensure_ascii=False, indent=2)

    # 3. Scan 1fps thumbnails to find all camera intervals
    print("Scanning video frames to detect all fullscreen camera intervals...")
    thumb_pattern = os.path.join(thumbs_dir, "thumb_%04d.jpg")
    cmd_thumb = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-vf", "fps=1,scale=160:90",
        thumb_pattern
    ]
    subprocess.run(cmd_thumb, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    thumb_files = sorted(glob.glob(os.path.join(thumbs_dir, "thumb_*.jpg")))
    cam_seconds = []
    for i, f in enumerate(thumb_files):
        sec = i
        img = Image.open(f).convert('L')
        arr = np.array(img)
        crop = arr[15:65, 15:75]
        mean_val = np.mean(crop)
        is_cam = mean_val < 185
        cam_seconds.append((sec, is_cam))

    intervals = []
    in_cam = False
    start_s = 0
    for sec, is_cam in cam_seconds:
        if is_cam:
            if not in_cam:
                in_cam = True
                start_s = sec
        else:
            if in_cam:
                in_cam = False
                if sec - start_s >= 2:
                    intervals.append((start_s, sec))
    if in_cam:
        intervals.append((start_s, len(cam_seconds)))

    print(f"Detected {len(intervals)} Fullscreen Camera intervals:", intervals)

    # 4. Generate Slide Graphics
    intro_slide = os.path.join(lesson_dir, "slide_intro.png")
    topic_slide = os.path.join(lesson_dir, "slide_topic.png")
    outro_slide = os.path.join(lesson_dir, "slide_outro.png")
    sidebar_mask = os.path.join(lesson_dir, "sidebar_mask.png")

    create_slide_intro(title, chapter_name, intro_slide)
    create_slide_topic(title, "", topic_slide)
    create_slide_outro(title, outro_slide)
    create_sidebar_mask(sidebar_mask)

    # 5. Synthesize Audio
    print(f"Synthesizing {len(sentences)} speech blocks...")
    sem = asyncio.Semaphore(8)
    tasks = [synthesize_single_sentence(i, s, audio_dir, sem) for i, s in enumerate(sentences)]
    await asyncio.gather(*tasks)

    # Build NumPy Timeline
    timeline = np.zeros(total_samples, dtype=np.int16)
    for i, s in enumerate(sentences):
        start_time = s["start"]
        end_time = s["end"]
        target_dur = end_time - start_time
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(audio_dir, f"sent_{block_id}.mp3")

        if not os.path.exists(raw_audio):
            continue

        raw_dur = get_audio_duration(raw_audio)
        if raw_dur <= 0.05:
            continue

        if raw_dur > target_dur + 0.2:
            speed = min(1.35, raw_dur / target_dur)
            cmd_pcm = [
                "ffmpeg", "-y",
                "-i", raw_audio,
                "-filter:a", f"atempo={speed:.3f}",
                "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE),
                "-"
            ]
        else:
            cmd_pcm = [
                "ffmpeg", "-y",
                "-i", raw_audio,
                "-f", "s16le", "-ac", "1", "-ar", str(SAMPLE_RATE),
                "-"
            ]

        pcm_bytes = subprocess.check_output(cmd_pcm, stderr=subprocess.DEVNULL)
        samples = np.frombuffer(pcm_bytes, dtype=np.int16)

        start_idx = int(start_time * SAMPLE_RATE)
        end_idx = min(total_samples, start_idx + len(samples))
        clip_len = end_idx - start_idx

        if clip_len > 0 and start_idx < total_samples:
            timeline[start_idx:end_idx] = samples[:clip_len]

    raw_pcm_path = os.path.join(lesson_dir, "timeline.raw")
    timeline.tofile(raw_pcm_path)
    wav_audio_path = os.path.join(lesson_dir, "synced_audio.wav")
    convert_cmd = [
        "ffmpeg", "-y",
        "-f", "s16le", "-ar", str(SAMPLE_RATE), "-ac", "1",
        "-i", raw_pcm_path,
        "-c:a", "pcm_s16le",
        wav_audio_path
    ]
    subprocess.run(convert_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

    # 6. Build Multi-Stage FFmpeg Overlay Expression
    # Separate intervals into Intro (around 0..20s), Mid intervals, Outro (last 20s)
    intro_end = 18
    outro_start = max(0, total_duration - 15)
    mid_intervals = []

    for s, e in intervals:
        if e <= 25:
            intro_end = max(intro_end, e)
        elif s >= total_duration - 25:
            outro_start = min(outro_start, s)
        else:
            mid_intervals.append((s, e))

    print(f"Filter timings -> Intro: 0..{intro_end}s | Mid Cam intervals: {mid_intervals} | Outro: {outro_start}..{total_duration}s")

    # Mid conditions
    mid_conds = "+".join([f"between(t,{s},{e})" for s, e in mid_intervals])
    
    # Sidebar condition (whenever not in intro, not in mid cam, and not in outro)
    all_cam_conds = [f"between(t,0,{intro_end})", f"gte(t,{outro_start})"]
    for s, e in mid_intervals:
        all_cam_conds.append(f"between(t,{s},{e})")
    
    # Construct overlay chain
    # 0: video, 1: intro_slide, 2: topic_slide, 3: outro_slide, 4: sidebar_mask, 5: audio
    v_chain = "[0:v][1:v]overlay=0:0:enable='between(t,0," + str(intro_end) + ")'[v1];"
    if mid_conds:
        v_chain += f"[v1][2:v]overlay=0:0:enable='{mid_conds}'[v2];"
        v_chain += f"[v2][3:v]overlay=0:0:enable='gte(t,{outro_start})'[v3];"
        v_chain += f"[v3][4:v]overlay=0:0:enable='not({' + '.join(all_cam_conds)})'[v]"
    else:
        v_chain += f"[v1][3:v]overlay=0:0:enable='gte(t,{outro_start})'[v3];"
        v_chain += f"[v3][4:v]overlay=0:0:enable='not({' + '.join(all_cam_conds)})'[v]"

    final_output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-i", intro_slide,
        "-i", topic_slide,
        "-i", outro_slide,
        "-i", sidebar_mask,
        "-i", wav_audio_path,
        "-filter_complex", v_chain,
        "-map", "[v]",
        "-map", "5:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        final_output_path
    ]
    print("Encoding final video with FFmpeg...")
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"[SUCCESS] Video rendered at: {final_output_path}")

async def main():
    # Batch 1: Lessons 2, 3, 4, 5, 6 of Part 5
    batch_lessons = [
        {
            "id": "v6",
            "title": "Cách làm bài tập cụm danh từ",
            "chapter_name": "Làm chủ ngữ pháp trọng tâm Part 5",
            "url": "https://www.youtube.com/watch?v=GcrpCgL-hFU",
            "output_filename": "grammar_part5_noun_phrases.mp4"
        },
        {
            "id": "v7",
            "title": "Bài tập vị trí danh từ",
            "chapter_name": "Làm chủ ngữ pháp trọng tâm Part 5",
            "url": "https://www.youtube.com/watch?v=1ZaCLji0zxc",
            "output_filename": "grammar_part5_noun_positions.mp4"
        },
        {
            "id": "v8",
            "title": "(Nâng cao) Hai danh từ đứng cạnh nhau",
            "chapter_name": "Làm chủ ngữ pháp trọng tâm Part 5",
            "url": "https://www.youtube.com/watch?v=DtEQlM2wDRU",
            "output_filename": "grammar_part5_compound_nouns.mp4"
        },
        {
            "id": "v9",
            "title": "(Nâng cao) Danh từ số ít không đứng một mình",
            "chapter_name": "Làm chủ ngữ pháp trọng tâm Part 5",
            "url": "https://www.youtube.com/watch?v=32ap6oXJzjg",
            "output_filename": "grammar_part5_singular_nouns.mp4"
        },
        {
            "id": "v10",
            "title": "(Nâng cao) Danh từ đuôi -al và -ive",
            "chapter_name": "Làm chủ ngữ pháp trọng tâm Part 5",
            "url": "https://www.youtube.com/watch?v=XdWvmQXs-P4",
            "output_filename": "grammar_part5_noun_suffixes_al_ive.mp4"
        }
    ]

    for lesson in batch_lessons:
        await process_single_lesson(lesson)

if __name__ == "__main__":
    asyncio.run(main())
