import os
from PIL import Image, ImageDraw, ImageFont

TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw"
os.makedirs(TEMP_DIR, exist_ok=True)

WIDTH, HEIGHT = 1920, 1080

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

# ========================================================
# 1. Full-Screen Intro Slide (0:00 to 0:18)
# ========================================================
intro_img = Image.new("RGB", (WIDTH, HEIGHT), (10, 15, 29))
d_intro = ImageDraw.Draw(intro_img)

# Background Grid & Glowing circles
d_intro.rectangle([0, 0, WIDTH, HEIGHT], fill=(10, 15, 29))
d_intro.rounded_rectangle([100, 80, WIDTH - 100, HEIGHT - 80], radius=32, fill=(15, 23, 42), outline=(56, 189, 248), width=3)

# Top Bar inside Intro Slide
d_intro.rounded_rectangle([140, 120, 520, 180], radius=16, fill=(30, 41, 59), outline=(56, 189, 248), width=1)
d_intro.text((165, 136), "🎯 TƯỜNG TẬN TOEIC • VIP LESSON", fill=(56, 189, 248), font=get_font(22, bold=True))

# Center Titles
d_intro.text((140, 240), "CHUYÊN ĐỀ NGỮ PHÁP PART 5", fill=(52, 211, 153), font=get_font(32, bold=True))
d_intro.text((140, 310), "Cách Làm Câu Từ Loại & Các Hậu Tố Thường Gặp", fill=(255, 255, 255), font=get_font(52, bold=True))
d_intro.text((140, 400), "Nhận diện nhanh Danh từ, Tính từ, Động từ, Trạng từ & Mẹo giải đề trong 3 giây", fill=(148, 163, 184), font=get_font(26, bold=False))

# 3 Highlights Cards
cards = [
    {"title": "⏱️ 30 Câu Part 5", "desc": "Cấu trúc đề thi & Phân bổ thời gian làm bài chuẩn ETS", "color": (56, 189, 248)},
    {"title": "🔍 Mẹo Nhận Biết", "desc": "4 Đáp án cùng gốc từ, khác phần đuôi (hậu tố)", "color": (251, 191, 36)},
    {"title": "🧠 Thần Chú SM-2", "desc": "Người chuẩn men thì cần ship vẻ đẹp văn hóa", "color": (52, 211, 153)}
]

card_w = 480
start_x = 140
for i, c in enumerate(cards):
    cx = start_x + i * (card_w + 50)
    d_intro.rounded_rectangle([cx, 500, cx + card_w, 740], radius=24, fill=(20, 30, 55), outline=c["color"], width=2)
    d_intro.text((cx + 30, 535), c["title"], fill=c["color"], font=get_font(26, bold=True))
    d_intro.text((cx + 30, 600), c["desc"], fill=(226, 232, 240), font=get_font(20, bold=False))

# Bottom Footer
d_intro.rounded_rectangle([140, 820, WIDTH - 140, 920], radius=20, fill=(30, 41, 59))
d_intro.text((180, 850), "🎙️ Thuyết minh tự động bằng AI Giảng viên Tường Tận TOEIC Studio • Chuẩn ngữ âm & Timeline", fill=(56, 189, 248), font=get_font(22, bold=True))

intro_path = os.path.join(TEMP_DIR, "fullscreen_intro_slide.png")
intro_img.save(intro_path)
print("Saved fullscreen_intro_slide.png")


# ========================================================
# 2. Right-Sidebar Cover (0:18 to 9:54)
# ========================================================
sidebar_img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
d_side = ImageDraw.Draw(sidebar_img)

# Top-Left Logo Cover
d_side.rounded_rectangle([20, 15, 380, 75], radius=14, fill=(10, 15, 29, 255), outline=(56, 189, 248, 255), width=2)
d_side.text((40, 28), "🎯 TƯỜNG TẬN TOEIC", fill=(56, 189, 248, 255), font=get_font(24, bold=True))

# Full Right-Sidebar Cover from x: 1350 to 1920, y: 0 to 1080
d_side.rectangle([1350, 0, 1920, 1080], fill=(10, 15, 29, 255))
d_side.line([(1350, 0), (1350, 1080)], fill=(56, 189, 248, 255), width=3)

# Inside Right Sidebar: Header
d_side.rounded_rectangle([1380, 30, 1890, 110], radius=18, fill=(15, 23, 42, 255), outline=(56, 189, 248, 255), width=1)
d_side.text((1405, 48), "🎙️ AI GIẢNG VIÊN STUDIO", fill=(56, 189, 248, 255), font=get_font(22, bold=True))
d_side.text((1405, 80), "● Đang giảng bài trực tiếp theo slide", fill=(52, 211, 153, 255), font=get_font(15, bold=False))

# Inside Right Sidebar: Card 1 - Hậu Tố Cốt Lõi
d_side.rounded_rectangle([1380, 130, 1890, 480], radius=20, fill=(15, 30, 58, 255), outline=(51, 65, 85, 255), width=1)
d_side.text((1405, 155), "📖 BẢNG HẬU TỐ PART 5", fill=(251, 191, 36, 255), font=get_font(22, bold=True))

d_side.text((1405, 205), "1. DANH TỪ (Nouns):", fill=(56, 189, 248, 255), font=get_font(17, bold=True))
d_side.text((1405, 230), "• Chỉ người: -er, -ee, -or, -ist, -ian, -ant", fill=(226, 232, 240, 255), font=get_font(15, bold=False))
d_side.text((1405, 255), "• Khái niệm: -tion, -ment, -ce, -ness, -ty", fill=(226, 232, 240, 255), font=get_font(15, bold=False))

d_side.text((1405, 290), "2. TÍNH TỪ (Adjectives):", fill=(56, 189, 248, 255), font=get_font(17, bold=True))
d_side.text((1405, 315), "• -able, -ous, -ful, -less, -ive, -al, -ic", fill=(226, 232, 240, 255), font=get_font(15, bold=False))

d_side.text((1405, 350), "3. ĐỘNG TỪ (Verbs):", fill=(56, 189, 248, 255), font=get_font(17, bold=True))
d_side.text((1405, 375), "• -ate, -ify, -en, -ize", fill=(226, 232, 240, 255), font=get_font(15, bold=False))

d_side.text((1405, 410), "4. TRẠNG TỪ (Adverbs):", fill=(56, 189, 248, 255), font=get_font(17, bold=True))
d_side.text((1405, 435), "• Tính từ + đuôi -ly (safe -> safely)", fill=(226, 232, 240, 255), font=get_font(15, bold=False))

# Inside Right Sidebar: Card 2 - Thần Chú Ghi Nhớ
d_side.rounded_rectangle([1380, 505, 1890, 770], radius=20, fill=(20, 35, 75, 255), outline=(52, 211, 153, 200), width=1)
d_side.text((1405, 530), "💡 MẸO GHI NHỚ THẦN THÁNH", fill=(52, 211, 153, 255), font=get_font(20, bold=True))
d_side.text((1405, 570), '"Người chuẩn men thì cần ship', fill=(255, 255, 255, 255), font=get_font(18, bold=True))
d_side.text((1405, 600), ' vẻ đẹp văn hóa"', fill=(255, 255, 255, 255), font=get_font(18, bold=True))

d_side.text((1405, 640), "• Chuẩn = -tion/sion   • Men = -ment", fill=(148, 163, 184, 255), font=get_font(15, bold=False))
d_side.text((1405, 670), "• Thì = -ce            • Cần = -ness", fill=(148, 163, 184, 255), font=get_font(15, bold=False))
d_side.text((1405, 700), "• Ship = -ship         • Vẻ đẹp = -ty", fill=(148, 163, 184, 255), font=get_font(15, bold=False))
d_side.text((1405, 730), "• Văn hóa = -ure (culture)", fill=(148, 163, 184, 255), font=get_font(15, bold=False))

# Inside Right Sidebar: Card 3 - Footer Tường Tận TOEIC
d_side.rounded_rectangle([1380, 800, 1890, 1040], radius=20, fill=(15, 23, 42, 255), outline=(56, 189, 248, 150), width=1)
d_side.text((1405, 825), "🎯 TƯỜNG TẬN TOEIC 2026", fill=(56, 189, 248, 255), font=get_font(20, bold=True))
d_side.text((1405, 865), "• 8.164 Câu hỏi ETS 5 Cấp độ", fill=(203, 213, 225, 255), font=get_font(15, bold=False))
d_side.text((1405, 895), "• 11.785 Câu Nghe chép chính tả", fill=(203, 213, 225, 255), font=get_font(15, bold=False))
d_side.text((1405, 925), "• 3.500+ Từ vựng Spaced Repetition", fill=(203, 213, 225, 255), font=get_font(15, bold=False))
d_side.text((1405, 955), "• 91 Bộ đề ETS Full 200 câu", fill=(203, 213, 225, 255), font=get_font(15, bold=False))
d_side.text((1405, 995), "👉 Làm bài tập ngay bên dưới video!", fill=(251, 191, 36, 255), font=get_font(16, bold=True))

sidebar_path = os.path.join(TEMP_DIR, "right_sidebar_mask.png")
sidebar_img.save(sidebar_path)
print("Saved right_sidebar_mask.png")
