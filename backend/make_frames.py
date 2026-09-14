import os
import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageOps

# Ensure output directory exists
out_dir = r"A:\frontend\tuong_tan_toeic\frontend\public\assets\frames"
os.makedirs(out_dir, exist_ok=True)

# 1. Process the user's uploaded Gold Royal Frame (media_1788077450160.png)
user_img_path = r"C:\Users\ANH TUONG\.gemini\antigravity-ide\brain\28edc2c8-44fe-40c7-9eeb-f649b7a8fb5b\.user_uploaded\media_1788077450160.png"
img = Image.open(user_img_path).convert("RGBA")

# Crop out bottom right icons (headphone and upload button)
w, h = img.size
# Crop main frame area
crop_box = (0, 0, w, int(h * 0.88))
img_cropped = img.crop(crop_box)
cw, ch = img_cropped.size

# Make square and centered
max_dim = max(cw, ch)
square_img = Image.new("RGBA", (max_dim, max_dim), (0, 0, 0, 0))
offset_x = (max_dim - cw) // 2
offset_y = (max_dim - ch) // 2
square_img.paste(img_cropped, (offset_x, offset_y))

# Convert to numpy for mask creation
arr = np.array(square_img)
r, g, b, a = arr[:,:,0], arr[:,:,1], arr[:,:,2], arr[:,:,3]

# The faux checkered background consists of grey/white squares (#e0e0e0, #ffffff)
# Where (r ~ g ~ b) and brightness > 180 or grey checkerboard pattern
diff_rg = np.abs(r.astype(int) - g.astype(int))
diff_gb = np.abs(g.astype(int) - b.astype(int))
diff_rb = np.abs(r.astype(int) - b.astype(int))
is_grey = (diff_rg < 18) & (diff_gb < 18) & (diff_rb < 18) & (r > 160)

# Golden elements have high red/green and lower blue (r > 100, g > 60, r > b + 25) or ruby red (r > 120, g < 60, b < 60)
is_gold = ((r > b + 20) & (r > 70) & (g > 45)) | ((r > 100) & (g < 60) & (b < 60))

# Center circle hole
cy, cx = max_dim * 0.48, max_dim * 0.5
y_coords, x_coords = np.ogrid[:max_dim, :max_dim]
dist_from_center = np.sqrt((x_coords - cx)**2 + (y_coords - cy)**2)
inner_radius = max_dim * 0.23
outer_radius = max_dim * 0.46

# Inside inner circle is completely transparent
is_inner = dist_from_center < inner_radius
is_outer = dist_from_center > outer_radius

new_alpha = a.copy()
new_alpha[is_inner] = 0
new_alpha[is_outer & is_grey] = 0
new_alpha[is_grey & (dist_from_center < outer_radius * 0.9)] = 0

# Feather alpha mask for smooth edges
arr[:,:,3] = new_alpha
gold_frame = Image.fromarray(arr)

# Resize to high-res standard 512x512
gold_frame_512 = gold_frame.resize((512, 512), Image.Resampling.LANCZOS)
gold_path = os.path.join(out_dir, "gold_royal_frame.png")
gold_frame_512.save(gold_path, "PNG")
print(f"Saved: {gold_path}")

# 2. Generate Silver Royal Frame (Hue shift / desaturate + boost sapphire gems)
silver_arr = np.array(gold_frame_512).copy()
# Convert RGB to HSV for clean color transformation
hsv = cv2.cvtColor(silver_arr[:,:,:3], cv2.COLOR_RGB2HSV).astype(np.float32)
# Desaturate gold into platinum silver
hsv[:,:,1] = hsv[:,:,1] * 0.15 # low saturation for chrome/silver
hsv[:,:,2] = np.clip(hsv[:,:,2] * 1.15, 0, 255) # shiny highlights
silver_rgb = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2RGB)

silver_arr[:,:,:3] = silver_rgb
silver_frame = Image.fromarray(silver_arr)
silver_path = os.path.join(out_dir, "silver_royal_frame.png")
silver_frame.save(silver_path, "PNG")
print(f"Saved: {silver_path}")

# 3. Generate Bronze / Antique Copper Frame (Warm deep amber & bronze)
bronze_arr = np.array(gold_frame_512).copy()
hsv_b = cv2.cvtColor(bronze_arr[:,:,:3], cv2.COLOR_RGB2HSV).astype(np.float32)
# Shift hue towards deeper copper/orange (H: ~15-20)
hsv_b[:,:,0] = np.clip(hsv_b[:,:,0] * 0.7, 5, 25)
hsv_b[:,:,1] = np.clip(hsv_b[:,:,1] * 1.3, 0, 255)
hsv_b[:,:,2] = np.clip(hsv_b[:,:,2] * 0.85, 0, 255)
bronze_rgb = cv2.cvtColor(hsv_b.astype(np.uint8), cv2.COLOR_HSV2RGB)

bronze_arr[:,:,:3] = bronze_rgb
bronze_frame = Image.fromarray(bronze_arr)
bronze_path = os.path.join(out_dir, "bronze_royal_frame.png")
bronze_frame.save(bronze_path, "PNG")
print(f"Saved: {bronze_path}")

# 4. ALSO Process our 1024x1024 Generated Ultra-HD Frames
hd_gold_src = r"C:\Users\ANH TUONG\.gemini\antigravity-ide\brain\28edc2c8-44fe-40c7-9eeb-f649b7a8fb5b\gold_crown_avatar_frame_1788077523089.jpg"
if os.path.exists(hd_gold_src):
    hd_img = Image.open(hd_gold_src).convert("RGBA")
    hd_arr = np.array(hd_img)
    
    # Black background to transparent
    hd_r, hd_g, hd_b = hd_arr[:,:,0], hd_arr[:,:,1], hd_arr[:,:,2]
    brightness = np.maximum(hd_r, np.maximum(hd_g, hd_b))
    
    # Hollow out the circular center
    hw, hh = hd_img.size
    hcy, hcx = hh * 0.53, hw * 0.5
    hy, hx = np.ogrid[:hh, :hw]
    hdist = np.sqrt((hx - hcx)**2 + (hy - hcy)**2)
    
    hd_alpha = np.clip((brightness - 20) * 8, 0, 255).astype(np.uint8)
    hd_alpha[hdist < hw * 0.26] = 0 # Transparent center for avatar
    
    hd_arr[:,:,3] = hd_alpha
    hd_gold_png = Image.fromarray(hd_arr).resize((512, 512), Image.Resampling.LANCZOS)
    hd_gold_png.save(os.path.join(out_dir, "gold_ultra_frame.png"), "PNG")
    print("Saved: gold_ultra_frame.png")

print("ALL ROYAL FRAMES GENERATED SUCCESSFULLY!")
