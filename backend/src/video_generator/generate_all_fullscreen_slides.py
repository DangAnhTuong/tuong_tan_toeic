import os
from PIL import Image, ImageDraw, ImageFont

TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw"
os.makedirs(TEMP_DIR, exist_ok=True)

# Colors
BG_DARK = (10, 15, 29) # #0a0f1d
CARD_BG = (17, 24, 39) # #111827
BORDER_CYAN = (6, 182, 212) # #06b6d4
BORDER_AMBER = (245, 158, 11) # #f59e0b
TEXT_WHITE = (255, 255, 255)
TEXT_CYAN = (103, 232, 249)
TEXT_AMBER = (252, 211, 77)
TEXT_MUTED = (148, 163, 184)
ACCENT_BLUE = (37, 99, 235)

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

# ==========================================
# 1. Slide 1: Intro Slide (0:00 - 0:18)
# ==========================================
def create_intro_slide():
    img = Image.new("RGBA", (1920, 1080), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    # Outer frame
    draw.rectangle([(20, 20), (1900, 1060)], outline=(30, 41, 59), width=3)
    draw.rectangle([(24, 24), (1896, 1056)], outline=BORDER_CYAN, width=2)
    
    # Header Badge
    draw.rounded_rectangle([(760, 80), (1160, 135)], radius=15, fill=(15, 23, 42), outline=BORDER_CYAN, width=2)
    draw.text((790, 93), "🎯 TƯỜNG TẬN TOEIC 2026", font=get_font(24, True), fill=TEXT_CYAN)
    
    # Main Title
    draw.text((360, 200), "CHUYÊN ĐỀ NGỮ PHÁP PART 5", font=get_font(52, True), fill=TEXT_AMBER)
    draw.text((280, 280), "CÁCH LÀM CÂU TỪ LOẠI & CÁC HẬU TỐ THƯỜNG GẶP", font=get_font(42, True), fill=TEXT_WHITE)
    
    # 4 Feature Cards
    cards = [
        ("1. DANH TỪ (Nouns)", "Chỉ người: -er, -ee, -or, -ist, -ian, -ant\nKhái niệm: -tion, -ment, -ce, -ness, -ty", BORDER_CYAN),
        ("2. TÍNH TỪ (Adjectives)", "Đặc điểm: -able, -ous, -ful, -less\nChức năng: -ive, -al, -ic", (59, 130, 246)),
        ("3. ĐỘNG TỪ (Verbs)", "Hành động: -ate, -ify, -en, -ize\nVí dụ: shorten, modernize, simplify", (168, 85, 247)),
        ("4. TRẠNG TỪ (Adverbs)", "Quy tắc: Tính từ + đuôi -ly\nVí dụ: safe -> safely, careful -> carefully", (16, 185, 129))
    ]
    
    for i, (title, desc, color) in enumerate(cards):
        x = 100 + (i % 2) * 880
        y = 400 + (i // 2) * 260
        draw.rounded_rectangle([(x, y), (x + 840, y + 220)], radius=18, fill=CARD_BG, outline=color, width=2)
        draw.text((x + 35, y + 30), title, font=get_font(28, True), fill=color)
        draw.text((x + 35, y + 85), desc, font=get_font(22, False), fill=TEXT_MUTED)

    # Footer
    draw.text((680, 990), "⚡ Video Bài Giảng Chuẩn ETS • Lồng Tiếng AI Studio 100%", font=get_font(22, True), fill=TEXT_CYAN)
    
    path = os.path.join(TEMP_DIR, "fullscreen_intro_slide.png")
    img.save(path)
    print(f"Created: {path}")

# ==========================================
# 2. Slide 2: Mnemonic Slide (5:41 - 6:04)
# ==========================================
def create_mnemonic_slide():
    img = Image.new("RGBA", (1920, 1080), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    # Outer frame
    draw.rectangle([(20, 20), (1900, 1060)], outline=(30, 41, 59), width=3)
    draw.rectangle([(24, 24), (1896, 1056)], outline=BORDER_AMBER, width=2)
    
    # Header Badge
    draw.rounded_rectangle([(720, 70), (1200, 125)], radius=15, fill=(15, 23, 42), outline=BORDER_AMBER, width=2)
    draw.text((750, 83), "🧠 BÍ KÍP GHI NHỚ THẦN THÁNH", font=get_font(24, True), fill=TEXT_AMBER)
    
    # Big Mantra Box
    draw.rounded_rectangle([(180, 160), (1740, 290)], radius=22, fill=(30, 41, 59), outline=BORDER_AMBER, width=3)
    draw.text((220, 185), '"Người chuẩn men thì cần ship vẻ đẹp văn hóa"', font=get_font(46, True), fill=TEXT_AMBER)
    draw.text((450, 245), "🔥 Câu thần chú ghi nhớ trọn bộ 8 Hậu Tố Danh Từ (Nouns) Part 5 🔥", font=get_font(24, False), fill=TEXT_CYAN)

    # Breakdown Grid (8 Cards)
    mnemonics = [
        ("Người", "-er, -ee, -or, -ist, -ian, -ant", "worker, trainee, doctor, pianist, technician"),
        ("Chuẩn", "-tion / -sion", "preparation, decision, conclusion, expansion"),
        ("Men", "-ment", "development, management, agreement, payment"),
        ("Thì", "-ce", "difference, importance, evidence, practice"),
        ("Cần", "-ness", "business, kindness, happiness, darkness"),
        ("Ship", "-ship", "friendship, relationship, leadership, membership"),
        ("Vẻ đẹp", "-ty (beauty)", "safety, beauty, quality, variety, activity"),
        ("Văn hóa", "-ure (culture)", "culture, structure, picture, failure")
    ]

    for i, (word, suffix, examples) in enumerate(mnemonics):
        col = i % 4
        row = i // 4
        x = 80 + col * 445
        y = 330 + row * 310
        w = 420
        h = 280
        
        draw.rounded_rectangle([(x, y), (x + w, y + h)], radius=16, fill=CARD_BG, outline=BORDER_CYAN, width=2)
        # Word badge
        draw.rounded_rectangle([(x + 20, y + 20), (x + 160, y + 65)], radius=10, fill=(15, 23, 42), outline=BORDER_AMBER, width=1)
        draw.text((x + 35, y + 28), word, font=get_font(24, True), fill=TEXT_AMBER)
        
        draw.text((x + 20, y + 85), suffix, font=get_font(26, True), fill=TEXT_CYAN)
        draw.text((x + 20, y + 135), "Ví dụ:", font=get_font(18, True), fill=(203, 213, 225))
        
        # Word wrap examples
        ex_lines = examples.split(', ')
        l1 = ", ".join(ex_lines[:3])
        l2 = ", ".join(ex_lines[3:])
        draw.text((x + 20, y + 165), l1, font=get_font(18, False), fill=TEXT_MUTED)
        if l2:
            draw.text((x + 20, y + 195), l2, font=get_font(18, False), fill=TEXT_MUTED)

    # Footer
    draw.text((640, 990), "🎯 TƯỜNG TẬN TOEIC • Phương Pháp Ghi Nhớ Ngữ Pháp Nhanh Nhất", font=get_font(22, True), fill=TEXT_CYAN)
    
    path = os.path.join(TEMP_DIR, "fullscreen_mnemonic_slide.png")
    img.save(path)
    print(f"Created: {path}")

# ==========================================
# 3. Slide 3: Outro Slide (9:42 - 9:54)
# ==========================================
def create_outro_slide():
    img = Image.new("RGBA", (1920, 1080), BG_DARK)
    draw = ImageDraw.Draw(img)
    
    # Outer frame
    draw.rectangle([(20, 20), (1900, 1060)], outline=(30, 41, 59), width=3)
    draw.rectangle([(24, 24), (1896, 1056)], outline=(16, 185, 129), width=2)
    
    # Header Badge
    draw.rounded_rectangle([(740, 120), (1180, 175)], radius=15, fill=(15, 23, 42), outline=(16, 185, 129), width=2)
    draw.text((770, 133), "🎉 HOÀN THÀNH BÀI HỌC", font=get_font(24, True), fill=(52, 211, 153))
    
    # Main Title
    draw.text((380, 250), "BẠN ĐÃ NẮM VỮNG QUY TẮC TỪ LOẠI PART 5!", font=get_font(46, True), fill=TEXT_WHITE)
    draw.text((450, 330), "Hãy làm ngay 5 câu trắc nghiệm bên dưới để nhận +50 XP", font=get_font(32, False), fill=TEXT_CYAN)

    # Summary Box
    draw.rounded_rectangle([(300, 430), (1620, 830)], radius=20, fill=CARD_BG, outline=BORDER_CYAN, width=2)
    
    items = [
        ("🎯 Bước 1: Nhìn 4 đáp án", "Cùng gốc từ nhưng khác hậu tố (đuôi) -> Xác định đây là câu Từ loại."),
        ("🔍 Bước 2: Nhìn trước và sau chỗ trống", "Xác định từ loại cần điền (Danh từ, Tính từ, Động từ hay Trạng từ)."),
        ("⚡ Bước 3: Áp dụng bảng hậu tố", "Chọn đáp án có đuôi phù hợp theo câu thần chú hoặc quy tắc hậu tố."),
        ("📝 Thực hành liên tục", "Luyện tập ngay tại Mô-đun Reading & Đề thi 18.200 câu hỏi ETS thật.")
    ]
    
    for i, (title, desc) in enumerate(items):
        y = 470 + i * 85
        draw.text((360, y), title, font=get_font(26, True), fill=TEXT_AMBER)
        draw.text((750, y + 2), desc, font=get_font(22, False), fill=TEXT_MUTED)

    # Footer
    draw.text((660, 980), "🎯 TƯỜNG TẬN TOEIC — Hệ Thống Luyện Thi TOEIC Toàn Diện", font=get_font(24, True), fill=TEXT_CYAN)
    
    path = os.path.join(TEMP_DIR, "fullscreen_outro_slide.png")
    img.save(path)
    print(f"Created: {path}")

create_intro_slide()
create_mnemonic_slide()
create_outro_slide()
