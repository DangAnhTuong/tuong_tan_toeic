import os
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont
from moviepy.editor import ImageClip, AudioFileClip, concatenate_videoclips, CompositeVideoClip
import numpy as np

# Output Directories
OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_video_assets"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# 1920x1080 Canvas Settings
WIDTH, HEIGHT = 1920, 1080

# Colors (Dark Cyber Palette)
BG_COLOR = (11, 17, 32)         # Deep midnight blue #0b1120
CARD_BG = (15, 23, 42)          # Slate-900 #0f172a
CARD_BORDER = (51, 65, 85)      # Slate-700 #334155
CYAN = (56, 189, 248)           # Sky-400 #38bdf8
EMERALD = (52, 211, 153)        # Emerald-400 #34d399
AMBER = (251, 191, 36)          # Amber-400 #fbbf24
WHITE = (248, 250, 252)         # Slate-50 #f8fafc
TEXT_MUTED = (148, 163, 184)    # Slate-400 #94a3b8
PURPLE = (168, 85, 247)         # Purple-500 #a855f7

def get_font(size, bold=False):
    font_names = [
        "arialbd.ttf" if bold else "arial.ttf",
        "seguisb.ttf" if bold else "segoeui.ttf",
        "tahoma.ttf",
        "calibri.ttf"
    ]
    for fn in font_names:
        try:
            return ImageFont.truetype(fn, size)
        except:
            continue
    return ImageFont.load_default()

def draw_header(draw, title, subtitle="TƯỜNG TẬN TOEIC • BÀI GIẢNG TRỌNG TÂM 2026"):
    # Brand Pill
    draw.rounded_rectangle([80, 50, 480, 95], radius=15, fill=(15, 23, 42), outline=CYAN, width=2)
    font_brand = get_font(22, bold=True)
    draw.text((105, 62), "🎯 TƯỜNG TẬN TOEIC", fill=CYAN, font=font_brand)
    
    # Subtitle Pill
    draw.rounded_rectangle([500, 50, 1000, 95], radius=15, fill=(15, 23, 42), outline=CARD_BORDER, width=1)
    font_sub = get_font(18, bold=True)
    draw.text((520, 64), subtitle, fill=TEXT_MUTED, font=font_sub)

    # Main Section Title
    font_title = get_font(46, bold=True)
    draw.text((80, 130), title, fill=WHITE, font=font_title)
    
    # Divider line
    draw.line([80, 200, 1840, 200], fill=CARD_BORDER, width=2)

def create_slide_1():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Glow Circle
    draw.ellipse([WIDTH//2 - 400, HEIGHT//2 - 300, WIDTH//2 + 400, HEIGHT//2 + 300], fill=(20, 40, 80))
    
    # Brand Top Badge
    draw.rounded_rectangle([WIDTH//2 - 250, 180, WIDTH//2 + 250, 240], radius=25, fill=(15, 23, 42), outline=EMERALD, width=2)
    font_badge = get_font(24, bold=True)
    draw.text((WIDTH//2 - 220, 195), "⭐ HỆ THỐNG LUYỆN THI TOEIC SỐ 1", fill=EMERALD, font=font_badge)

    # Main Big Title
    font_hero = get_font(72, bold=True)
    draw.text((WIDTH//2 - 620, 300), "CẤU TRÚC & THANG ĐIỂM", fill=WHITE, font=font_hero)
    
    font_sub = get_font(56, bold=True)
    draw.text((WIDTH//2 - 400, 410), "BÀI THI TOEIC QUỐC TẾ", fill=CYAN, font=font_sub)

    # Info Feature Card Box
    draw.rounded_rectangle([WIDTH//2 - 500, 560, WIDTH//2 + 500, 800], radius=30, fill=CARD_BG, outline=CARD_BORDER, width=3)
    
    font_card = get_font(32, bold=True)
    draw.text((WIDTH//2 - 440, 600), "🎧 100 Câu Listening (45 Phút)  •  Max 495 Điểm", fill=CYAN, font=font_card)
    draw.text((WIDTH//2 - 440, 660), "📖 100 Câu Reading   (75 Phút)  •  Max 495 Điểm", fill=EMERALD, font=font_card)
    draw.text((WIDTH//2 - 440, 720), "🏆 Tổng Điểm 10 - 990 Điểm  •  Chuẩn Định Dạng ETS", fill=AMBER, font=font_card)
    
    # Footer
    font_foot = get_font(24, bold=False)
    draw.text((WIDTH//2 - 220, 950), "Biên soạn bởi Ban Học Thuật Tường Tận TOEIC", fill=TEXT_MUTED, font=font_foot)
    
    path = os.path.join(TEMP_DIR, "slide_1.png")
    img.save(path)
    return path

def create_slide_2():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "1. TỔNG QUAN CẤU TRÚC ĐỀ THI TOEIC")

    # 4 Highlight Metric Cards
    cards = [
        ("⏱️ TỔNG THỜI GIAN", "120 Phút", "45 phút Nghe + 75 phút Đọc", CYAN),
        ("📝 TỔNG SỐ CÂU", "200 Câu", "100 câu Nghe + 100 câu Đọc", EMERALD),
        ("🎯 THANG ĐIỂM", "10 - 990", "Listening 495 + Reading 495", AMBER),
        ("📄 HÌNH THỨC", "Trắc Nghiệm", "Tô phiếu trả lời hoặc máy tính", PURPLE)
    ]
    
    positions = [
        (80, 240, 920, 560),
        (1000, 240, 1840, 560),
        (80, 600, 920, 920),
        (1000, 600, 1840, 920)
    ]
    
    for (title, value, desc, color), (x1, y1, x2, y2) in zip(cards, positions):
        draw.rounded_rectangle([x1, y1, x2, y2], radius=25, fill=CARD_BG, outline=color, width=2)
        font_t = get_font(26, bold=True)
        draw.text((x1 + 40, y1 + 35), title, fill=color, font=font_t)
        
        font_v = get_font(52, bold=True)
        draw.text((x1 + 40, y1 + 95), value, fill=WHITE, font=font_v)
        
        font_d = get_font(24, bold=False)
        draw.text((x1 + 40, y1 + 190), desc, fill=TEXT_MUTED, font=font_d)
        
    path = os.path.join(TEMP_DIR, "slide_2.png")
    img.save(path)
    return path

def create_slide_3():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "2. PHẦN 1: LISTENING (100 CÂU • 45 PHÚT • MAX 495 ĐIỂM)")

    parts = [
        ("PART 1: MÔ TẢ TRANH", "6 Câu", "Xem 1 bức tranh, nghe 4 đáp án (A,B,C,D) chọn miêu tả đúng nhất", CYAN),
        ("PART 2: HỎI & ĐÁP", "25 Câu", "Nghe 1 câu hỏi/phát biểu và 3 đáp án (A,B,C) để tìm câu trả lời hợp lý", EMERALD),
        ("PART 3: HỘI THOẠI NGẮN", "39 Câu", "13 đoạn hội thoại 2-3 người. Mỗi đoạn có 3 câu hỏi trắc nghiệm 4 lựa chọn", AMBER),
        ("PART 4: BÀI NÓI CHUYỆN", "30 Câu", "10 bài độc thoại (thông báo, quảng cáo, tin nhắn thoại...). Mỗi bài 3 câu hỏi", PURPLE)
    ]
    
    y = 240
    for title, count, desc, color in parts:
        draw.rounded_rectangle([80, y, 1840, y + 150], radius=20, fill=CARD_BG, outline=CARD_BORDER, width=2)
        # Left Accent Bar
        draw.rounded_rectangle([80, y, 95, y + 150], radius=5, fill=color)
        
        font_t = get_font(28, bold=True)
        draw.text((120, y + 25), title, fill=color, font=font_t)
        
        font_c = get_font(26, bold=True)
        draw.rounded_rectangle([720, y + 20, 880, y + 68], radius=12, fill=(20, 35, 60), outline=color, width=1)
        draw.text((750, y + 27), count, fill=WHITE, font=font_c)
        
        font_d = get_font(22, bold=False)
        draw.text((120, y + 85), desc, fill=TEXT_MUTED, font=font_d)
        y += 180

    path = os.path.join(TEMP_DIR, "slide_3.png")
    img.save(path)
    return path

def create_slide_4():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "3. PHẦN 2: READING (100 CÂU • 75 PHÚT • MAX 495 ĐIỂM)")

    parts = [
        ("PART 5: HOÀN THÀNH CÂU", "30 Câu", "Điền từ vào chỗ trống. Kiểm tra từ loại, thì, từ vựng và ngữ pháp trọng tâm", CYAN),
        ("PART 6: HOÀN THÀNH ĐOẠN VĂN", "16 Câu", "4 bài đọc ngắn, mỗi bài 4 câu hỏi. Điền từ, cụm từ hoặc câu văn phù hợp vào ngữ cảnh", EMERALD),
        ("PART 7: ĐỌC HIỂU ĐOẠN VĂN", "54 Câu", "Gồm 29 câu Đoạn đơn (1 bài) + 25 câu Đoạn kép/Đoạn ba (2-3 bài email, bài báo, website, bảng biểu)", AMBER)
    ]
    
    y = 250
    for title, count, desc, color in parts:
        draw.rounded_rectangle([80, y, 1840, y + 190], radius=20, fill=CARD_BG, outline=CARD_BORDER, width=2)
        draw.rounded_rectangle([80, y, 95, y + 190], radius=5, fill=color)
        
        font_t = get_font(32, bold=True)
        draw.text((120, y + 30), title, fill=color, font=font_t)
        
        font_c = get_font(28, bold=True)
        draw.rounded_rectangle([800, y + 25, 980, y + 78], radius=15, fill=(20, 35, 60), outline=color, width=1)
        draw.text((835, y + 33), count, fill=WHITE, font=font_c)
        
        font_d = get_font(24, bold=False)
        draw.text((120, y + 105), desc, fill=TEXT_MUTED, font=font_d)
        y += 230

    path = os.path.join(TEMP_DIR, "slide_4.png")
    img.save(path)
    return path

def create_slide_5():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "4. NGUYÊN TẮC TÍNH ĐIỂM & BẢNG QUY ĐỔI ETS")

    # Left Box: 3 Golden Rules
    draw.rounded_rectangle([80, 240, 920, 940], radius=25, fill=CARD_BG, outline=CARD_BORDER, width=2)
    font_h = get_font(30, bold=True)
    draw.text((120, 280), "⭐ 3 NGUYÊN TẮC CẦN NHỚ", fill=AMBER, font=font_h)

    rules = [
        ("1. Không tính 5 điểm / câu:", "Điểm được quy đổi qua bảng thống kê độ khó của ETS."),
        ("2. Làm sai KHÔNG bị trừ điểm:", "Tuyệt đối không bao giờ để trống câu hỏi khi hết giờ!"),
        ("3. Nghe thường dễ lấy điểm hơn:", "Cùng số câu đúng, Listening cho mức điểm cao hơn Reading.")
    ]
    ry = 360
    for r_title, r_desc in rules:
        font_rt = get_font(24, bold=True)
        draw.text((120, ry), r_title, fill=WHITE, font=font_rt)
        font_rd = get_font(20, bold=False)
        draw.text((120, ry + 40), r_desc, fill=TEXT_MUTED, font=font_rd)
        ry += 150

    # Right Box: Conversion Table Reference
    draw.rounded_rectangle([1000, 240, 1840, 940], radius=25, fill=CARD_BG, outline=CYAN, width=2)
    draw.text((1040, 280), "📊 THAM KHẢO QUY ĐỔI ĐIỂM", fill=CYAN, font=font_h)

    table_rows = [
        ("Số câu đúng", "Điểm Listening", "Điểm Reading", "Tổng Điểm Dự Kiến"),
        ("30 / 100", "150 điểm", "110 điểm", "260 điểm"),
        ("50 / 100", "260 điểm", "220 điểm", "480 điểm (Tốt nghiệp CĐ/ĐH)"),
        ("70 / 100", "360 điểm", "310 điểm", "670 điểm (Chuẩn Doanh nghiệp)"),
        ("85 / 100", "440 điểm", "400 điểm", "840 điểm (Cao cấp)"),
        ("95 / 100", "490 điểm", "480 điểm", "970+ điểm (Xuất sắc)")
    ]

    ty = 360
    for idx, (c1, c2, c3, c4) in enumerate(table_rows):
        is_header = (idx == 0)
        row_bg = (30, 45, 75) if is_header else ((20, 30, 50) if idx % 2 == 1 else CARD_BG)
        draw.rounded_rectangle([1040, ty, 1800, ty + 65], radius=10, fill=row_bg)
        
        font_cell = get_font(18 if not is_header else 20, bold=is_header)
        color_cell = CYAN if is_header else (EMERALD if "480" in c4 or "670" in c4 else WHITE)
        
        draw.text((1060, ty + 18), c1, fill=color_cell, font=font_cell)
        draw.text((1230, ty + 18), c2, fill=color_cell, font=font_cell)
        draw.text((1420, ty + 18), c3, fill=color_cell, font=font_cell)
        draw.text((1600, ty + 18), c4, fill=color_cell, font=font_cell)
        ty += 80

    path = os.path.join(TEMP_DIR, "slide_5.png")
    img.save(path)
    return path

def create_slide_6():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "5. BẮT ĐẦU LUYỆN TẬP NGAY CÙNG TƯỜNG TẬN TOEIC")

    # 3 Target Badges
    targets = [
        ("🎯 MỤC TIÊU 450 - 550+", "Chuẩn Đầu Ra Đại Học", "Học chắc từ vựng Part 1-2 & Ngữ pháp cơ bản Part 5", CYAN),
        ("🚀 MỤC TIÊU 650 - 750+", "Xin Việc Doanh Nghiệp & Đa Quốc Gia", "Tăng tốc độ làm Part 7 và kỹ năng nghe bẫy Part 3-4", EMERALD),
        ("🏆 MỤC TIÊU 850 - 990", "Bứt Phá Điểm Số Đỉnh Cao", "Luyện trọn bộ 91 Đề ETS thật tại Tường Tận TOEIC", AMBER)
    ]

    x = 80
    for title, subtitle, desc, color in targets:
        draw.rounded_rectangle([x, 240, x + 560, 720], radius=25, fill=CARD_BG, outline=color, width=2)
        font_t = get_font(28, bold=True)
        draw.text((x + 35, 280), title, fill=color, font=font_t)
        
        font_sub = get_font(22, bold=True)
        draw.text((x + 35, 340), subtitle, fill=WHITE, font=font_sub)
        
        font_desc = get_font(20, bold=False)
        draw.text((x + 35, 420), desc, fill=TEXT_MUTED, font=font_desc)
        
        # Bottom Badge
        draw.rounded_rectangle([x + 35, 600, x + 525, 660], radius=15, fill=(20, 35, 60), outline=color, width=1)
        font_btn = get_font(20, bold=True)
        draw.text((x + 120, 620), "BẮT ĐẦU LUYỆN", fill=color, font=font_btn)
        x += 600

    # Call to action footer box
    draw.rounded_rectangle([80, 780, 1840, 940], radius=25, fill=(15, 30, 60), outline=EMERALD, width=2)
    font_cta = get_font(34, bold=True)
    draw.text((WIDTH//2 - 580, 820), "👉 Hãy làm bài tập trắc nghiệm tương tác ngay bên dưới video!", fill=EMERALD, font=font_cta)
    font_cta_sub = get_font(22, bold=False)
    draw.text((WIDTH//2 - 400, 880), "Ghi nhớ kiến thức tức thì và tích lũy điểm XP để mở khóa bài học tiếp theo.", fill=TEXT_MUTED, font=font_cta_sub)

    path = os.path.join(TEMP_DIR, "slide_6.png")
    img.save(path)
    return path

# Script narration texts for each slide
SLIDE_SCRIPTS = [
    (
        "slide_1.png",
        "Xin chào các bạn! Chào mừng bạn đến với Tường Tận TOEIC. Trong bài học mở đầu hôm nay, chúng ta sẽ cùng tìm hiểu toàn diện về Cấu trúc và Thang điểm của bài thi TOEIC Quốc Tế theo chuẩn định dạng ETS mới nhất."
    ),
    (
        "slide_2.png",
        "Đầu tiên là tổng quan: Bài thi TOEIC Listening và Reading gồm đúng 200 câu hỏi trắc nghiệm với tổng thời gian làm bài là 120 phút. Thang điểm dao động từ 10 đến 990 điểm, trong đó phần Nghe và phần Đọc mỗi phần chiếm tối đa 495 điểm."
    ),
    (
        "slide_3.png",
        "Phần thi thứ nhất là Luyện Nghe, gồm 100 câu trong 45 phút, chia thành 4 Part. Part 1 gồm 6 câu mô tả hình ảnh. Part 2 gồm 25 câu hỏi đáp ngắn. Part 3 gồm 39 câu với 13 đoạn hội thoại. Và Part 4 gồm 30 câu với 10 bài nói chuyện độc thoại."
    ),
    (
        "slide_4.png",
        "Phần thi thứ hai là Đọc hiểu, kéo dài 75 phút gồm 3 Part. Part 5 gồm 30 câu trắc nghiệm ngữ pháp và từ vựng. Part 6 gồm 16 câu hoàn thành đoạn văn. Và Part 7 là phần dài nhất với 54 câu đọc hiểu các bài báo, email, tin nhắn và bảng biểu."
    ),
    (
        "slide_5.png",
        "Về nguyên tắc tính điểm: Điểm TOEIC không cộng đều 5 điểm cho mỗi câu, mà quy đổi theo bảng chuẩn của ETS. Đặc biệt, làm sai không bị trừ điểm, nên bạn tuyệt đối không được bỏ trống câu hỏi nào khi đi thi."
    ),
    (
        "slide_6.png",
        "Dù mục tiêu của bạn là 450 điểm tốt nghiệp, 650 điểm xin việc hay 850+ bứt phá, Tường Tận TOEIC đã chuẩn bị sẵn lộ trình khép kín. Bây giờ, hãy làm các câu hỏi trắc nghiệm tương tác ngay bên dưới video để kiểm tra mức độ nắm bắt của bạn nhé!"
    )
]

async def generate_audio_and_video():
    print("Generating slides...")
    create_slide_1()
    create_slide_2()
    create_slide_3()
    create_slide_4()
    create_slide_5()
    create_slide_6()
    
    clips = []
    
    print("Generating voice narration with Edge-TTS...")
    for idx, (slide_img_name, script_text) in enumerate(SLIDE_SCRIPTS):
        audio_path = os.path.join(TEMP_DIR, f"audio_{idx+1}.mp3")
        slide_img_path = os.path.join(TEMP_DIR, slide_img_name)
        
        # Call Edge-TTS
        communicate = edge_tts.Communicate(script_text, "vi-VN-NamMinhNeural", rate="+5%")
        await communicate.save(audio_path)
        print(f"Generated audio {idx+1}/{len(SLIDE_SCRIPTS)}")
        
        # Load audio clip and calculate duration
        audio_clip = AudioFileClip(audio_path)
        duration = audio_clip.duration + 0.6  # Add small padding
        
        # Create image clip matching audio length
        img_clip = ImageClip(slide_img_path).set_duration(duration).set_audio(audio_clip)
        clips.append(img_clip)
        
    print("Concatenating video clips...")
    final_video = concatenate_videoclips(clips, method="compose")
    
    output_mp4 = os.path.join(OUTPUT_DIR, "toeic_structure_scoring.mp4")
    print(f"Rendering final MP4 to {output_mp4}...")
    final_video.write_videofile(
        output_mp4, 
        fps=24, 
        codec="libx264", 
        audio_codec="aac", 
        preset="fast",
        threads=4
    )
    print("Video generation completed successfully!")

if __name__ == "__main__":
    asyncio.run(generate_audio_and_video())
