from PIL import Image, ImageDraw, ImageFont
import os

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

# Create Transparent Overlay
overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)

# 1. Top-Left Logo Cover
draw.rounded_rectangle([40, 20, 420, 85], radius=15, fill=(10, 15, 29, 255), outline=(56, 189, 248, 255), width=2)
draw.text((65, 36), "🎯 TƯỜNG TẬN TOEIC", fill=(56, 189, 248, 255), font=get_font(24, bold=True))

# 2. Right-Hand Webcam Face Mask Cover (x: 1080 to 1880, y: 340 to 880)
# Card Background
draw.rounded_rectangle([1080, 340, 1880, 880], radius=28, fill=(10, 15, 29, 255), outline=(56, 189, 248, 255), width=3)
draw.rounded_rectangle([1080, 340, 1880, 410], radius=28, fill=(15, 23, 42, 255))
draw.rounded_rectangle([1080, 380, 1880, 410], fill=(15, 23, 42, 255))

# Header Inside Card
draw.text((1120, 360), "🎙️ AI GIẢNG VIÊN TƯỜNG TẬN TOEIC", fill=(56, 189, 248, 255), font=get_font(22, bold=True))

# Soundwave / Cyber Graphic inside mask
draw.rounded_rectangle([1120, 440, 1840, 680], radius=20, fill=(15, 30, 58, 255), outline=(51, 65, 85, 255), width=2)
draw.text((1150, 470), "📖 LÀM CHỦ PART 5 TOEIC", fill=(52, 211, 153, 255), font=get_font(26, bold=True))
draw.text((1150, 520), "• Hậu tố Danh từ: -tion, -ment, -ness, -ty", fill=(248, 250, 252, 255), font=get_font(20, bold=False))
draw.text((1150, 560), "• Hậu tố Tính từ: -able, -ous, -ful, -ive", fill=(248, 250, 252, 255), font=get_font(20, bold=False))
draw.text((1150, 600), "• Hậu tố Động từ: -ate, -ify, -en, -ize", fill=(248, 250, 252, 255), font=get_font(20, bold=False))
draw.text((1150, 640), "• Hậu tố Trạng từ: Tính từ + ly", fill=(251, 191, 36, 255), font=get_font(20, bold=True))

# Bottom Branding Badge inside mask
draw.rounded_rectangle([1120, 720, 1840, 840], radius=18, fill=(20, 35, 75, 255), outline=(56, 189, 248, 200), width=1)
draw.text((1150, 745), "⚡ Đang thuyết minh tự động bằng AI Voice Studio", fill=(56, 189, 248, 255), font=get_font(18, bold=True))
draw.text((1150, 785), "Lộ trình ngữ pháp trọng tâm 450 - 650 - 850+ TOEIC", fill=(148, 163, 184, 255), font=get_font(16, bold=False))

mask_path = os.path.join(TEMP_DIR, "mask_overlay.png")
overlay.save(mask_path)
print("Mask overlay saved to:", mask_path)
