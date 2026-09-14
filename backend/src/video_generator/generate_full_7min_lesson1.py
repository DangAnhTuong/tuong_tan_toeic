import os
import asyncio
import edge_tts
from PIL import Image, ImageDraw, ImageFont
import subprocess

# Directories
OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_video_assets_full"
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

# 1920x1080 Dimensions
WIDTH, HEIGHT = 1920, 1080

# Colors (Premium Dark Cyber Theme)
BG_COLOR = (10, 15, 29)         # Deep Midnight Navy #0a0f1d
CARD_BG = (15, 23, 42)          # Slate-900 #0f172a
CARD_ALT = (20, 32, 58)         # Dark slate blue #14203a
BORDER_COLOR = (51, 65, 85)     # Slate-700 #334155
CYAN = (56, 189, 248)           # Sky-400 #38bdf8
EMERALD = (52, 211, 153)        # Emerald-400 #34d399
AMBER = (251, 191, 36)          # Amber-400 #fbbf24
ROSE = (251, 113, 133)          # Rose-400 #fb7185
PURPLE = (168, 85, 247)         # Purple-500 #a855f7
WHITE = (248, 250, 252)         # Slate-50 #f8fafc
TEXT_MUTED = (148, 163, 184)    # Slate-400 #94a3b8

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

def draw_header(draw, title, subtitle="CHƯƠNG 1: TÌM HIỂU BÀI THI TOEIC • BÀI GIẢNG 2026"):
    # Brand Pill
    draw.rounded_rectangle([80, 45, 480, 95], radius=15, fill=CARD_BG, outline=CYAN, width=2)
    draw.text((105, 58), "🎯 TƯỜNG TẬN TOEIC", fill=CYAN, font=get_font(22, bold=True))
    
    # Subtitle Pill
    draw.rounded_rectangle([500, 45, 1200, 95], radius=15, fill=CARD_BG, outline=BORDER_COLOR, width=1)
    draw.text((525, 60), subtitle, fill=TEXT_MUTED, font=get_font(18, bold=True))

    # Main Section Title
    draw.text((80, 120), title, fill=WHITE, font=get_font(44, bold=True))
    
    # Divider line
    draw.line([80, 185, 1840, 185], fill=BORDER_COLOR, width=2)

# =========================================================================
# 10 DETAILED SLIDES FOR FULL 7-MINUTE LESSON
# =========================================================================

def make_slide_1():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    draw.ellipse([WIDTH//2 - 500, HEIGHT//2 - 350, WIDTH//2 + 500, HEIGHT//2 + 350], fill=(20, 35, 75))
    
    draw.rounded_rectangle([WIDTH//2 - 280, 140, WIDTH//2 + 280, 205], radius=25, fill=CARD_BG, outline=EMERALD, width=2)
    draw.text((WIDTH//2 - 245, 158), "🌟 KHÓA HỌC TOEIC NỀN TẢNG 4 KỸ NĂNG", fill=EMERALD, font=get_font(22, bold=True))

    draw.text((WIDTH//2 - 600, 260), "CẤU TRÚC & THANG ĐIỂM", fill=WHITE, font=get_font(68, bold=True))
    draw.text((WIDTH//2 - 420, 360), "BÀI THI TOEIC QUỐC TẾ 2026", fill=CYAN, font=get_font(52, bold=True))

    # 4 Key Points Cards
    draw.rounded_rectangle([WIDTH//2 - 550, 480, WIDTH//2 + 550, 840], radius=30, fill=CARD_BG, outline=BORDER_COLOR, width=3)
    
    draw.text((WIDTH//2 - 480, 520), "🎧 Listening: 100 câu • 45 phút • Thang điểm 5 - 495", fill=CYAN, font=get_font(30, bold=True))
    draw.text((WIDTH//2 - 480, 600), "📖 Reading: 100 câu • 75 phút • Thang điểm 5 - 495", fill=EMERALD, font=get_font(30, bold=True))
    draw.text((WIDTH//2 - 480, 680), "🎯 Tổng điểm: 10 - 990 • Quy đổi theo bảng chuẩn ETS", fill=AMBER, font=get_font(30, bold=True))
    draw.text((WIDTH//2 - 480, 760), "⭐ Không bị trừ điểm khi làm sai • 100% Trắc nghiệm", fill=ROSE, font=get_font(30, bold=True))
    
    draw.text((WIDTH//2 - 260, 960), "Biên soạn độc quyền bởi Tường Tận TOEIC Studio", fill=TEXT_MUTED, font=get_font(22, bold=False))
    
    path = os.path.join(TEMP_DIR, "slide_01.png")
    img.save(path)
    return path

def make_slide_2():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "1. TỔNG QUAN VỀ BÀI THI TOEIC LISTENING & READING")

    # Left Column: Definition & Target (80 -> 920)
    draw.rounded_rectangle([80, 220, 920, 950], radius=25, fill=CARD_BG, outline=BORDER_COLOR, width=2)
    draw.text((120, 260), "📌 TOEIC LÀ GÌ?", fill=AMBER, font=get_font(32, bold=True))
    
    intro_paragraphs = [
        ("Tên đầy đủ:", "Test of English for International Communication."),
        ("Mục đích:", "Đánh giá năng lực tiếng Anh trong môi trường làm việc quốc tế và giao tiếp thương mại hàng ngày."),
        ("Đơn vị cấp chứng chỉ:", "Viện Khảo thí Giáo dục Hoa Kỳ (ETS)."),
        ("Thời hạn bằng:", "2 năm kể từ ngày cấp, có giá trị công nhận toàn cầu."),
        ("Hình thức thi:", "Thi trên giấy (Paper-based) hoặc máy tính (Computer-based).")
    ]
    y = 330
    for label, val in intro_paragraphs:
        draw.text((120, y), label, fill=CYAN, font=get_font(22, bold=True))
        draw.text((120, y + 35), val, fill=WHITE, font=get_font(20, bold=False))
        y += 115

    # Right Column: Format metrics
    metrics = [
        ("⏱️ TỔNG THỜI GIAN", "120 Phút", "45 phút Nghe liên tục + 75 phút Đọc hiểu", CYAN),
        ("📝 TỔNG SỐ CÂU", "200 Câu", "100 câu Listening + 100 câu Reading", EMERALD),
        ("🎯 THANG ĐIỂM", "10 - 990 Điểm", "Listening (5 - 495) + Reading (5 - 495)", AMBER)
    ]
    my = 220
    for title, val, desc, col in metrics:
        draw.rounded_rectangle([1000, my, 1840, my + 215], radius=25, fill=CARD_BG, outline=col, width=2)
        draw.text((1040, my + 25), title, fill=col, font=get_font(26, bold=True))
        draw.text((1040, my + 80), val, fill=WHITE, font=get_font(48, bold=True))
        draw.text((1040, my + 155), desc, fill=TEXT_MUTED, font=get_font(22, bold=False))
        my += 255

    path = os.path.join(TEMP_DIR, "slide_02.png")
    img.save(path)
    return path

def make_slide_3():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "2. PHẦN 1: LISTENING COMPREHENSION (PART 1 & 2)")

    # Box 1: Part 1
    draw.rounded_rectangle([80, 220, 1840, 560], radius=25, fill=CARD_BG, outline=CYAN, width=2)
    draw.rounded_rectangle([80, 220, 100, 560], radius=5, fill=CYAN)
    
    draw.text((130, 255), "PART 1: MÔ TẢ HÌNH ẢNH (PHOTOGRAPHS)", fill=CYAN, font=get_font(30, bold=True))
    draw.rounded_rectangle([1650, 250, 1800, 300], radius=15, fill=(20, 40, 70), outline=CYAN, width=1)
    draw.text((1685, 260), "6 CÂU", fill=WHITE, font=get_font(22, bold=True))

    p1_details = [
        ("• Hình thức:", "Xem 1 bức ảnh chụp trong đề thi, lắng nghe 4 câu mô tả (A, B, C, D) từ loa."),
        ("• Đặc điểm:", "Các phương án (A, B, C, D) KHÔNG được in trong đề. Chỉ nghe 1 lần duy nhất."),
        ("• Các dạng tranh:", "Tranh 1 người (tập trung hành động), Tranh nhiều người (hoạt động nhóm), Tranh đồ vật & cảnh quan.")
    ]
    py = 330
    for h, d in p1_details:
        draw.text((130, py), h, fill=EMERALD, font=get_font(22, bold=True))
        draw.text((320, py), d, fill=WHITE, font=get_font(20, bold=False))
        py += 65

    # Box 2: Part 2
    draw.rounded_rectangle([80, 600, 1840, 950], radius=25, fill=CARD_BG, outline=EMERALD, width=2)
    draw.rounded_rectangle([80, 600, 100, 950], radius=5, fill=EMERALD)

    draw.text((130, 635), "PART 2: HỎI & ĐÁP (QUESTION - RESPONSE)", fill=EMERALD, font=get_font(30, bold=True))
    draw.rounded_rectangle([1640, 630, 1800, 680], radius=15, fill=(20, 45, 60), outline=EMERALD, width=1)
    draw.text((1670, 640), "25 CÂU", fill=WHITE, font=get_font(22, bold=True))

    p2_details = [
        ("• Hình thức:", "Nghe 1 câu hỏi hoặc 1 câu phát biểu, sau đó nghe 3 câu đối đáp (A, B, C)."),
        ("• Điểm đặc biệt:", "DUY NHẤT Part 2 chỉ có 3 phương án (A, B, C), không có phương án D. Hoàn toàn không in chữ trong đề."),
        ("• Các dạng câu:", "Câu hỏi Who/Where/When/Why, Câu hỏi Yes/No, Câu hỏi lựa chọn Or, Câu hỏi đuôi, Câu trần thuật.")
    ]
    p2y = 710
    for h, d in p2_details:
        draw.text((130, p2y), h, fill=AMBER, font=get_font(22, bold=True))
        draw.text((350, p2y), d, fill=WHITE, font=get_font(20, bold=False))
        p2y += 65

    path = os.path.join(TEMP_DIR, "slide_03.png")
    img.save(path)
    return path

def make_slide_4():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "3. PHẦN 1: LISTENING COMPREHENSION (PART 3 & 4)")

    # Part 3
    draw.rounded_rectangle([80, 220, 1840, 560], radius=25, fill=CARD_BG, outline=AMBER, width=2)
    draw.rounded_rectangle([80, 220, 100, 560], radius=5, fill=AMBER)
    
    draw.text((130, 255), "PART 3: ĐOẠN HỘI THOẠI NGẮN (CONVERSATIONS)", fill=AMBER, font=get_font(30, bold=True))
    draw.rounded_rectangle([1640, 250, 1800, 300], radius=15, fill=(45, 35, 20), outline=AMBER, width=1)
    draw.text((1670, 260), "39 CÂU", fill=WHITE, font=get_font(22, bold=True))

    p3_details = [
        ("• Cấu trúc:", "Gồm 13 đoạn hội thoại giữa 2 hoặc 3 người. Mỗi đoạn có 3 câu hỏi trắc nghiệm (A, B, C, D)."),
        ("• Điểm in trong đề:", "CÂU HỎI VÀ 4 PHƯƠNG ÁN ĐƯỢC IN SẴN TRONG ĐỀ THI. Cần đọc trước câu hỏi trước khi audio phát."),
        ("• Dạng câu hỏi mới:", "Câu hỏi suy luận ngụ ý của người nói ('Why does the woman say...?'), Câu hỏi đọc bảng biểu/đồ thị đính kèm.")
    ]
    py = 330
    for h, d in p3_details:
        draw.text((130, py), h, fill=CYAN, font=get_font(22, bold=True))
        draw.text((370, py), d, fill=WHITE, font=get_font(20, bold=False))
        py += 65

    # Part 4
    draw.rounded_rectangle([80, 600, 1840, 950], radius=25, fill=CARD_BG, outline=PURPLE, width=2)
    draw.rounded_rectangle([80, 600, 100, 950], radius=5, fill=PURPLE)

    draw.text((130, 635), "PART 4: BÀI NÓI CHUYỆN NGẮN (SHORT TALKS)", fill=PURPLE, font=get_font(30, bold=True))
    draw.rounded_rectangle([1640, 630, 1800, 680], radius=15, fill=(40, 20, 60), outline=PURPLE, width=1)
    draw.text((1670, 640), "30 CÂU", fill=WHITE, font=get_font(22, bold=True))

    p4_details = [
        ("• Cấu trúc:", "Gồm 10 bài nói chuyện độc thoại (1 người nói). Mỗi bài có 3 câu hỏi trắc nghiệm in sẵn trong đề."),
        ("• Các chủ đề quen thuộc:", "Thông báo tại sân bay/nhà ga, Tin nhắn thoại (Voicemail), Bản tin thời tiết/giao thông, Quảng cáo, Bài thuyết trình công ty."),
        ("• Chiến thuật làm bài:", "Đọc trước 3 câu hỏi trong 8 giây nghỉ giữa các đoạn để định vị từ khóa cần nghe.")
    ]
    p4y = 710
    for h, d in p4_details:
        draw.text((130, p4y), h, fill=EMERALD, font=get_font(22, bold=True))
        draw.text((400, p4y), d, fill=WHITE, font=get_font(20, bold=False))
        p4y += 65

    path = os.path.join(TEMP_DIR, "slide_04.png")
    img.save(path)
    return path

def make_slide_5():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "4. PHẦN 2: READING COMPREHENSION (PART 5 & 6)")

    # Part 5
    draw.rounded_rectangle([80, 220, 1840, 560], radius=25, fill=CARD_BG, outline=CYAN, width=2)
    draw.rounded_rectangle([80, 220, 100, 560], radius=5, fill=CYAN)
    
    draw.text((130, 255), "PART 5: HOÀN THÀNH CÂU (INCOMPLETE SENTENCES)", fill=CYAN, font=get_font(30, bold=True))
    draw.rounded_rectangle([1640, 250, 1800, 300], radius=15, fill=(20, 40, 70), outline=CYAN, width=1)
    draw.text((1670, 260), "30 CÂU", fill=WHITE, font=get_font(22, bold=True))

    p5_details = [
        ("• Nội dung:", "30 câu ngắn độc lập (Câu 101 -> Câu 130). Mỗi câu có 1 chỗ trống cần chọn 1 trong 4 từ (A, B, C, D) để điền vào."),
        ("• Tỷ lệ phân bổ:", "Khoảng 60% câu Ngữ pháp (Từ loại, Chia thì, Đại từ, Giới từ, Liên từ) + 40% câu Từ vựng/Cụm từ cố định (Collocations)."),
        ("• Thời gian làm:", "Mục tiêu tối đa 12 - 15 phút (trung bình 25 - 30 giây/câu). Tuyệt đối không dừng lại quá lâu ở 1 câu từ vựng lạ.")
    ]
    py = 330
    for h, d in p5_details:
        draw.text((130, py), h, fill=EMERALD, font=get_font(22, bold=True))
        draw.text((350, py), d, fill=WHITE, font=get_font(20, bold=False))
        py += 65

    # Part 6
    draw.rounded_rectangle([80, 600, 1840, 950], radius=25, fill=CARD_BG, outline=EMERALD, width=2)
    draw.rounded_rectangle([80, 600, 100, 950], radius=5, fill=EMERALD)

    draw.text((130, 635), "PART 6: HOÀN THÀNH ĐOẠN VĂN (TEXT COMPLETION)", fill=EMERALD, font=get_font(30, bold=True))
    draw.rounded_rectangle([1640, 630, 1800, 680], radius=15, fill=(20, 45, 60), outline=EMERALD, width=1)
    draw.text((1670, 640), "16 CÂU", fill=WHITE, font=get_font(22, bold=True))

    p6_details = [
        ("• Cấu trúc:", "Gồm 4 bài đọc ngắn (Email, Thông báo, Bài báo, Thư từ). Mỗi bài có 4 chỗ trống (Câu 131 -> Câu 146)."),
        ("• Dạng câu hỏi:", "3 câu điền từ/cụm từ (từ vựng, ngữ pháp) + 1 CÂU ĐIỀN CẢ CÂU VĂN HOÀN CHỈNH vào ngữ cảnh bài đọc."),
        ("• Thời gian làm:", "Mục tiêu hoàn thành trong 8 - 10 phút (khoảng 2 phút/đoạn). Cần đọc hiểu mạch văn liền mạch.")
    ]
    p6y = 710
    for h, d in p6_details:
        draw.text((130, p6y), h, fill=AMBER, font=get_font(22, bold=True))
        draw.text((350, p6y), d, fill=WHITE, font=get_font(20, bold=False))
        p6y += 65

    path = os.path.join(TEMP_DIR, "slide_05.png")
    img.save(path)
    return path

def make_slide_6():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "5. PHẦN 2: READING COMPREHENSION (PART 7 - 54 CÂU)")

    # 3 Sub-parts Cards
    subparts = [
        ("ĐOẠN ĐƠN (SINGLE PASSAGES)", "29 Câu (Câu 147 -> 175)", "Gồm 10 bài đọc đơn lẻ. Mỗi bài có từ 2 đến 4 câu hỏi. Các dạng bài: Email, Thư công việc, Bài báo, Thông báo nội bộ, Tin nhắn chat điện thoại.", CYAN),
        ("ĐOẠN KÉP (DOUBLE PASSAGES)", "10 Câu (Câu 176 -> 185)", "Gồm 2 cặp bài đọc (mỗi cặp 2 văn bản liên kết, 5 câu hỏi/cặp). Thường kết hợp giữa Email đặt hàng + Hóa đơn, hoặc Bài quảng cáo + Email phản hồi.", EMERALD),
        ("ĐOẠN BA (TRIPLE PASSAGES)", "15 Câu (Câu 186 -> 200)", "Gồm 3 cụm bài đọc (mỗi cụm 3 văn bản liên kết, 5 câu hỏi/cụm). Yêu cầu đọc và đối chiếu thông tin chéo giữa 3 tài liệu để tìm đáp án.", AMBER)
    ]
    
    y = 230
    for title, count, desc, col in subparts:
        draw.rounded_rectangle([80, y, 1840, y + 210], radius=22, fill=CARD_BG, outline=col, width=2)
        draw.rounded_rectangle([80, y, 100, y + 210], radius=5, fill=col)

        draw.text((130, y + 25), title, fill=col, font=get_font(28, bold=True))
        draw.rounded_rectangle([1450, y + 20, 1800, y + 68], radius=12, fill=CARD_ALT, outline=col, width=1)
        draw.text((1475, y + 28), count, fill=WHITE, font=get_font(20, bold=True))

        draw.text((130, y + 90), desc, fill=WHITE, font=get_font(20, bold=False))
        draw.text((130, y + 145), "⚡ Mẹo: Dành từ 50 - 55 phút cho Part 7. Đọc câu hỏi trước, dùng kỹ năng Skimming & Scanning để định vị thông tin.", fill=TEXT_MUTED, font=get_font(18, bold=True))
        y += 245

    path = os.path.join(TEMP_DIR, "slide_06.png")
    img.save(path)
    return path

def make_slide_7():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "6. CƠ CHẾ TÍNH ĐIỂM & BẢNG QUY ĐỔI CHUẨN ETS")

    # Left Box: 4 Rules
    draw.rounded_rectangle([80, 220, 880, 950], radius=25, fill=CARD_BG, outline=BORDER_COLOR, width=2)
    draw.text((120, 260), "⭐ NGUYÊN TẮC TÍNH ĐIỂM", fill=AMBER, font=get_font(30, bold=True))

    rules = [
        ("1. Không tính 5 điểm / câu:", "Điểm được quy đổi từ số câu đúng (Raw Score 0 - 100) sang điểm chuẩn (Scaled Score 5 - 495) qua bảng thống kê độ khó của ETS."),
        ("2. Làm sai KHÔNG BỊ TRỪ ĐIỂM:", "Nếu không biết đáp án, hãy dùng phương pháp loại trừ và TÔ KÍN 100% ĐÁP ÁN trước khi hết giờ. Cơ hội đúng ngẫu nhiên là 25%!"),
        ("3. Listening điểm 'hào phóng' hơn:", "Cùng đúng 70 câu, Listening thường được ~360 điểm, trong khi Reading chỉ được ~310 điểm."),
        ("4. Điểm tối đa mỗi phần là 495:", "Tổng điểm tối đa là 990 điểm (chẵn theo bội số của 5).")
    ]
    ry = 340
    for r_title, r_desc in rules:
        draw.text((120, ry), r_title, fill=WHITE, font=get_font(22, bold=True))
        draw.text((120, ry + 38), r_desc, fill=TEXT_MUTED, font=get_font(18, bold=False))
        ry += 145

    # Right Box: Conversion Table
    draw.rounded_rectangle([940, 220, 1840, 950], radius=25, fill=CARD_BG, outline=CYAN, width=2)
    draw.text((980, 260), "📊 BẢNG QUY ĐỔI ĐIỂM THAM KHẢO ETS", fill=CYAN, font=get_font(30, bold=True))

    table_data = [
        ("Số Câu Đúng", "Listening", "Reading", "Tổng Điểm Dự Kiến"),
        ("20 / 100", "80 - 110", "60 - 80", "150 - 190 (Mất gốc)"),
        ("35 / 100", "160 - 190", "120 - 150", "300 - 340 điểm"),
        ("50 / 100", "260 - 290", "200 - 230", "480 - 520 (Chuẩn tốt nghiệp ĐH)"),
        ("65 / 100", "330 - 365", "280 - 310", "620 - 675 (Chuẩn Doanh nghiệp)"),
        ("80 / 100", "410 - 440", "360 - 390", "780 - 830 (Cao cấp)"),
        ("90 / 100", "465 - 485", "425 - 450", "890 - 935 (Xuất sắc)"),
        ("96 - 100", "495 MAX", "485 - 495", "980 - 990 ĐỈNH CAO")
    ]

    ty = 330
    for idx, (c1, c2, c3, c4) in enumerate(table_data):
        is_header = (idx == 0)
        row_bg = (30, 50, 85) if is_header else ((20, 30, 55) if idx % 2 == 1 else CARD_BG)
        draw.rounded_rectangle([980, ty, 1800, ty + 60], radius=10, fill=row_bg)
        
        font_c = get_font(18, bold=is_header)
        col_c = CYAN if is_header else (EMERALD if "ĐH" in c4 or "Doanh nghiệp" in c4 else (AMBER if "ĐỈNH" in c4 else WHITE))
        
        draw.text((1000, ty + 18), c1, fill=col_c, font=font_c)
        draw.text((1180, ty + 18), c2, fill=col_c, font=font_c)
        draw.text((1360, ty + 18), c3, fill=col_c, font=font_c)
        draw.text((1520, ty + 18), c4, fill=col_c, font=font_c)
        ty += 72

    path = os.path.join(TEMP_DIR, "slide_07.png")
    img.save(path)
    return path

def make_slide_8():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "7. CÁC MỐC ĐIỂM MỤC TIÊU & GIÁ TRỊ THỰC TẾ")

    milestones = [
        ("MỐC 450 - 550+", "CHUẨN ĐẦU RA TỐT NGHIỆP ĐẠI HỌC", "Yêu cầu bắt buộc của đa số các trường ĐH tại VN (Bách Khoa, Kinh Tế, Thủy Lợi, GTVT...). Tập trung chắc Part 1, 2 và ngữ pháp cơ bản Part 5.", CYAN),
        ("MỐC 650 - 750+", "CHUẨN ỨNG TUYỂN DOANH NGHIỆP & TẬP ĐOÀN", "Tạo lợi thế lớn khi nộp CV tại các tập đoàn lớn, Ngân hàng, Doanh nghiệp FDI (Samsung, Viettel, FPT, Big4...). Yêu cầu phản xạ nghe tốt và đọc Part 7 nhanh.", EMERALD),
        ("MỐC 850 - 990", "TRÌNH ĐỘ XUẤT SẮC - LÀM VIỆC QUỐC TẾ", "Mức điểm vàng để săn học bổng du học, làm việc môi trường 100% tiếng Anh, thăng tiến quản lý hoặc giảng dạy TOEIC chuyên nghiệp.", AMBER)
    ]
    
    y = 230
    for title, subtitle, desc, col in milestones:
        draw.rounded_rectangle([80, y, 1840, y + 210], radius=22, fill=CARD_BG, outline=col, width=2)
        draw.rounded_rectangle([80, y, 100, y + 210], radius=5, fill=col)

        draw.text((130, y + 25), title, fill=col, font=get_font(28, bold=True))
        draw.text((450, y + 28), subtitle, fill=WHITE, font=get_font(22, bold=True))
        
        draw.text((130, y + 90), desc, fill=TEXT_MUTED, font=get_font(20, bold=False))
        draw.text((130, y + 150), "🚀 Khuyến nghị: Học viên nên làm bài Test năng lực đầu vào tại Tường Tận TOEIC để chọn lộ trình tối ưu nhất.", fill=CYAN, font=get_font(18, bold=True))
        y += 245

    path = os.path.join(TEMP_DIR, "slide_08.png")
    img.save(path)
    return path

def make_slide_9():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "8. CHIẾN THUẬT PHÂN BỔ THỜI GIAN VÀNG TRONG PHÒNG THI")

    # Time Strategy Boxes
    draw.rounded_rectangle([80, 220, 920, 950], radius=25, fill=CARD_BG, outline=CYAN, width=2)
    draw.text((120, 260), "🎧 PHẦN NGHE (45 PHÚT)", fill=CYAN, font=get_font(30, bold=True))

    lis_strategies = [
        ("1. Tận dụng thời gian đọc hướng dẫn:", "Khi băng đọc Direction (khoảng 1.5 phút đầu mỗi Part), tranh thủ lật xem trước câu hỏi của Part 3 & 4."),
        ("2. Kỹ thuật tô đáp án dứt khoát:", "Audio nói xong là tô ngay vào phiếu. Không đắn đo quá 3 giây để không bị trôi câu tiếp theo."),
        ("3. Nguyên tắc 'Buông bỏ':", "Nếu lỡ bỏ lỡ 1 câu, hãy chọn bừa 1 đáp án và tập trung 100% nghe câu kế tiếp, không tiếc nuối!")
    ]
    ly = 340
    for st, sd in lis_strategies:
        draw.text((120, ly), st, fill=WHITE, font=get_font(22, bold=True))
        draw.text((120, ly + 38), sd, fill=TEXT_MUTED, font=get_font(18, bold=False))
        ly += 160

    # Reading Strategy Box
    draw.rounded_rectangle([1000, 220, 1840, 950], radius=25, fill=CARD_BG, outline=EMERALD, width=2)
    draw.text((1040, 260), "📖 PHẦN ĐỌC (75 PHÚT)", fill=EMERALD, font=get_font(30, bold=True))

    read_strategies = [
        ("• Part 5 (30 câu): Dành 12 - 15 phút", "Mỗi câu chỉ làm trong 25 - 30 giây. Câu nào quá khó thì đánh dấu để quay lại sau."),
        ("• Part 6 (16 câu): Dành 8 - 10 phút", "Khoảng 2 phút cho mỗi bài đọc 4 câu. Đọc lướt bắt ý chính trước khi điền."),
        ("• Part 7 (54 câu): Dành 50 - 55 phút", "Đoạn đơn: 25 phút. Đoạn kép & Đoạn ba: 25 - 30 phút. Đọc câu hỏi trước để tìm thông tin."),
        ("• 2 Phút cuối cùng:", "Kiểm tra toàn bộ phiếu trả lời, đảm bảo không bỏ trống bất kỳ câu nào!")
    ]
    ry = 340
    for st, sd in read_strategies:
        draw.text((1040, ry), st, fill=WHITE, font=get_font(22, bold=True))
        draw.text((1040, ry + 38), sd, fill=TEXT_MUTED, font=get_font(18, bold=False))
        ry += 135

    path = os.path.join(TEMP_DIR, "slide_09.png")
    img.save(path)
    return path

def make_slide_10():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG_COLOR)
    draw = ImageDraw.Draw(img)
    draw_header(draw, "9. TỔNG KẾT & BÀI TẬP CỦNG CỐ KIẾN THỨC")

    # Big CTA Summary Card
    draw.rounded_rectangle([80, 230, 1840, 750], radius=30, fill=CARD_BG, outline=EMERALD, width=3)

    draw.text((140, 280), "🎉 CHÚC MỪNG BẠN ĐÃ HOÀN THÀNH BÀI HỌC SỐ 1!", fill=EMERALD, font=get_font(38, bold=True))
    
    summary_bullets = [
        "1. Nắm chắc cấu trúc 200 câu trong 120 phút (100 câu Listening + 100 câu Reading).",
        "2. Hiểu rõ cơ chế thang điểm quy đổi 10 - 990 điểm và nguyên tắc không bị trừ điểm khi làm sai.",
        "3. Ghi nhớ chiến thuật phân bổ thời gian: 15 phút Part 5, 10 phút Part 6, 50 phút Part 7.",
        "4. Bắt đầu luyện tập bài học tiếp theo trong lộ trình 10 Chương của Tường Tận TOEIC."
    ]
    sy = 360
    for b in summary_bullets:
        draw.text((140, sy), b, fill=WHITE, font=get_font(24, bold=False))
        sy += 75

    # Bottom Action Box
    draw.rounded_rectangle([80, 790, 1840, 950], radius=25, fill=(15, 35, 70), outline=CYAN, width=2)
    draw.text((WIDTH//2 - 620, 830), "👉 Hãy làm ngay 5 câu hỏi trắc nghiệm tương tác bên dưới video!", fill=CYAN, font=get_font(32, bold=True))
    draw.text((WIDTH//2 - 450, 890), "Tích lũy ngay +100 XP để nâng hạng trên Bảng xếp hạng Tường Tận TOEIC.", fill=TEXT_MUTED, font=get_font(22, bold=False))

    path = os.path.join(TEMP_DIR, "slide_10.png")
    img.save(path)
    return path

# =========================================================================
# FULL SCRIPT FOR 10 SLIDES (~7 MINUTES DURATION)
# =========================================================================

FULL_SCRIPTS = [
    (
        "slide_01.png",
        "Xin chào các bạn! Chào mừng các bạn đã đến với Tường Tận TOEIC. Trong chuỗi video bài giảng mở đầu ngày hôm nay, chúng ta sẽ cùng nhau tìm hiểu toàn diện và chi tiết nhất về Cấu trúc bài thi TOEIC cũng như Thang điểm và Cơ chế tính điểm của bài thi TOEIC Quốc Tế theo định dạng chuẩn mới nhất của Viện Khảo thí Giáo dục Hoa Kỳ ETS. Việc nắm rõ cấu trúc và thang điểm ngay từ đầu là bước chuẩn bị quan trọng nhất giúp bạn định hình chiến lược học tập và phân bổ thời gian tối ưu cho từng phần thi."
    ),
    (
        "slide_02.png",
        "Đầu tiên, chúng ta cùng nhìn vào Tổng quan cấu trúc của bài thi TOEIC. Bài thi TOEIC gồm 2 kỹ năng chính là Listening và Reading, với tổng cộng đúng 200 câu hỏi trắc nghiệm và thời gian làm bài là 120 phút. Trong đó, phần thi Luyện Nghe Listening gồm 100 câu làm trong 45 phút, và phần thi Đọc hiểu Reading gồm 100 câu làm trong 75 phút. Tổng thang điểm của bài thi dao động từ 10 đến 990 điểm, chia đều cho 2 phần: Listening tối đa 495 điểm và Reading tối đa 495 điểm. Bạn sẽ làm bài trên phiếu trả lời Answer Sheet bằng bút chì hoặc thao tác trực tiếp trên máy tính tùy vào hình thức đăng ký thi."
    ),
    (
        "slide_03.png",
        "Bây giờ, chúng ta sẽ đi sâu vào chi tiết Phần thi thứ nhất: Luyện nghe Listening. Phần này gồm 4 Part, bắt đầu với Part 1 là Mô tả hình ảnh gồm 6 câu hỏi. Với mỗi câu, bạn sẽ nhìn một bức ảnh và nghe 4 phương án A, B, C, D từ băng phát thanh để chọn câu mô tả chuẩn xác nhất. Tiếp theo là Part 2, Hỏi và Đáp ngắn gồm 25 câu hỏi. Điểm đặc biệt của Part 2 là đây là phần duy nhất chỉ có 3 phương án lựa chọn A, B, C thay vì 4 phương án, và cả câu hỏi lẫn đáp án đều không được in trong đề thi, đòi hỏi bạn phải tập trung lắng nghe 100% để phản xạ."
    ),
    (
        "slide_04.png",
        "Tiếp tục với phần Listening là Part 3 và Part 4. Part 3 gồm 39 câu hỏi, được chia thành 13 đoạn hội thoại ngắn giữa 2 hoặc 3 người. Mỗi đoạn sẽ có 3 câu hỏi trắc nghiệm được in sẵn trong đề cùng 4 lựa chọn A, B, C, D. Part 3 cũng bao gồm các câu hỏi đọc biểu đồ và câu hỏi suy luận ngụ ý của người nói. Cuối cùng của phần nghe là Part 4 gồm 30 câu hỏi với 10 bài nói chuyện độc thoại như thông báo sân bay, tin nhắn thoại, bản tin thời tiết hoặc quảng cáo. Chiến thuật cốt lõi của Part 3 và 4 là bạn phải luôn tranh thủ đọc trước câu hỏi và từ khóa trước khi đoạn audio bắt đầu phát."
    ),
    (
        "slide_05.png",
        "Chuyển sang Phần thi thứ hai là Đọc hiểu Reading kéo dài 75 phút gồm 3 Part. Mở đầu là Part 5, Hoàn thành câu gồm 30 câu hỏi từ câu 101 đến 130. Part 5 kiểm tra khoảng 60% kiến thức ngữ pháp trọng tâm như từ loại, chia thì, đại từ, liên từ và 40% từ vựng. Bạn nên đặt mục tiêu hoàn thành Part 5 trong tối đa 12 đến 15 phút. Tiếp theo là Part 6, Hoàn thành đoạn văn gồm 16 câu chia làm 4 bài đọc ngắn. Mỗi bài có 4 chỗ trống, gồm 3 câu điền từ hoặc cụm từ và 1 câu điền cả câu văn hoàn chỉnh vào mạch bài. Bạn nên hoàn thành Part 6 trong khoảng 8 đến 10 phút."
    ),
    (
        "slide_06.png",
        "Part 7 là phần dài nhất và chiếm nhiều điểm nhất của phần Reading với tổng cộng 54 câu hỏi. Part 7 gồm 29 câu Đoạn đơn là các bài email, bài báo, thông báo ngắn; 10 câu Đoạn kép gồm 2 văn bản liên kết nhau; và 15 câu Đoạn ba gồm 3 văn bản liên kết chéo. Bạn cần dành trọn vẹn từ 50 đến 55 phút cho Part 7. Mẹo làm bài Part 7 hiệu quả là đọc câu hỏi trước để xác định từ khóa, sau đó dùng kỹ năng đọc lướt Skimming và quét thông tin Scanning để định vị câu trả lời nhanh chóng."
    ),
    (
        "slide_07.png",
        "Tiếp theo, chúng ta cùng tìm hiểu về Cơ chế tính điểm của bài thi TOEIC. Rất nhiều bạn lầm tưởng điểm TOEIC được tính theo cách cộng đều 5 điểm cho mỗi câu, nhưng thực tế điểm số được quy đổi từ số câu đúng sang thang điểm chuẩn theo Bảng quy đổi thống kê của ETS dựa trên độ khó của từng đề thi. Một nguyên tắc vàng bạn cần nhớ là làm sai KHÔNG BỊ TRỪ ĐIỂM, vì vậy bạn tuyệt đối không bao giờ được bỏ trống bất kỳ câu nào trên phiếu trả lời. Ngoài ra, phần Listening thường có mức điểm quy đổi cao hơn phần Reading cho cùng một số lượng câu đúng."
    ),
    (
        "slide_08.png",
        "Về các mốc điểm mục tiêu: Mức 450 đến 550 điểm là chuẩn đầu ra xét tốt nghiệp của hầu hết các trường Đại học tại Việt Nam, bạn chỉ cần nắm chắc từ vựng Part 1, 2 và ngữ pháp Part 5. Mức 650 đến 750 điểm là mức điểm chuẩn được các doanh nghiệp lớn và công ty đa quốc gia ưu tiên tuyển dụng. Và nếu bạn muốn làm việc trong môi trường quốc tế hoặc giảng dạy tiếng Anh, mức 850 đến 990 điểm là mục tiêu bạn cần hướng tới bằng cách luyện thành thạo trọn bộ đề ETS tại Tường Tận TOEIC."
    ),
    (
        "slide_09.png",
        "Về chiến thuật phân bổ thời gian vàng trong phòng thi: Đối với phần Nghe 45 phút, bạn hãy tận dụng tối đa thời gian đọc phần hướng dẫn để xem trước câu hỏi của Part 3 và 4, và luôn tô đáp án dứt khoát ngay khi câu nói kết thúc. Đối với phần Đọc 75 phút, hãy phân bổ nghiêm ngặt: 15 phút cho Part 5, 10 phút cho Part 6, và 50 phút trọn vẹn cho Part 7. Dành 2 phút cuối cùng để kiểm tra lại toàn bộ phiếu trả lời và đảm bảo đã tô kín 100% 200 câu hỏi."
    ),
    (
        "slide_10.png",
        "Như vậy là chúng ta đã cùng nhau tìm hiểu toàn bộ bức tranh tổng quan về Cấu trúc, Thang điểm và Chiến thuật làm bài thi TOEIC 2026. Để củng cố và ghi nhớ sâu toàn bộ kiến thức vừa học, các bạn hãy cùng kéo xuống ngay bên dưới video và hoàn thành 5 câu hỏi trắc nghiệm tương tác nhé. Chúc các bạn học tập thật tốt và đạt điểm số mơ ước cùng Tường Tận TOEIC!"
    )
]

async def generate_full_lesson_video():
    print("Step 1: Generating 10 High-Res 1080p Slides...")
    make_slide_1()
    make_slide_2()
    make_slide_3()
    make_slide_4()
    make_slide_5()
    make_slide_6()
    make_slide_7()
    make_slide_8()
    make_slide_9()
    make_slide_10()
    print("Slides generated successfully!")

    print("Step 2: Generating 10 Edge-TTS Audio Narration Clips...")
    concat_list_path = os.path.join(TEMP_DIR, "concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as f_concat:
        for idx, (slide_img_name, script_text) in enumerate(FULL_SCRIPTS):
            part_num = f"{idx+1:02d}"
            audio_path = os.path.join(TEMP_DIR, f"audio_{part_num}.mp3")
            slide_path = os.path.join(TEMP_DIR, slide_img_name)
            video_part_path = os.path.join(TEMP_DIR, f"part_{part_num}.mp4")

            # Check if video part already exists and is valid
            if not (os.path.exists(video_part_path) and os.path.getsize(video_part_path) > 10000):
                if not (os.path.exists(audio_path) and os.path.getsize(audio_path) > 1000):
                    txt_tmp = os.path.join(TEMP_DIR, f"script_{part_num}.txt")
                    with open(txt_tmp, "w", encoding="utf-8") as ft:
                        ft.write(script_text)
                    
                    tts_cmd = [
                        "edge-tts",
                        "--voice", "vi-VN-NamMinhNeural",
                        "--rate", "+4%",
                        "-f", txt_tmp,
                        "--write-media", audio_path
                    ]
                    success = False
                    for att in range(5):
                        try:
                            subprocess.run(tts_cmd, check=True)
                            if os.path.exists(audio_path) and os.path.getsize(audio_path) > 1000:
                                success = True
                                break
                        except Exception as e:
                            print(f"TTS retry {att+1}/5 on part {part_num}: {e}")
                            await asyncio.sleep(2)
                    if not success:
                        raise RuntimeError(f"Could not generate audio for part {part_num}")
                
                print(f"Generated Voiceover {idx+1}/{len(FULL_SCRIPTS)}")

                # Render Part with FFmpeg (fast static image + audio)
                cmd = [
                    "ffmpeg", "-y",
                    "-loop", "1", "-i", slide_path,
                    "-i", audio_path,
                    "-c:v", "libx264", "-tune", "stillimage",
                    "-c:a", "aac", "-b:a", "192k",
                    "-pix_fmt", "yuv420p",
                    "-shortest",
                    video_part_path
                ]
                subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                print(f"Rendered video part {part_num}.mp4")
            else:
                print(f"Skipping already rendered part_{part_num}.mp4")

            # Write to concat list
            norm_path = video_part_path.replace("\\", "/")
            f_concat.write(f"file '{norm_path}'\n")

    output_final_mp4 = os.path.join(OUTPUT_DIR, "toeic_structure_scoring.mp4")
    print(f"Step 3: Concatenating all parts to {output_final_mp4} with FFmpeg...")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        output_final_mp4
    ]
    subprocess.run(concat_cmd, check=True)
    print(f"SUCCESS! Full 7-minute Lesson 1 Video created at {output_final_mp4}")

if __name__ == "__main__":
    asyncio.run(generate_full_lesson_video())
