import os
import cv2
import numpy as np
from PIL import Image

out_dir = r"A:\frontend\tuong_tan_toeic\frontend\public\assets\frames"
os.makedirs(out_dir, exist_ok=True)

def process_hd_frame(src_path, out_name, center_y_ratio=0.53, inner_rad_ratio=0.26):
    if not os.path.exists(src_path):
        print(f"Not found: {src_path}")
        return
    hd_img = Image.open(src_path).convert("RGBA")
    hd_arr = np.array(hd_img)
    
    hd_r, hd_g, hd_b = hd_arr[:,:,0], hd_arr[:,:,1], hd_arr[:,:,2]
    brightness = np.maximum(hd_r, np.maximum(hd_g, hd_b))
    
    hw, hh = hd_img.size
    hcy, hcx = hh * center_y_ratio, hw * 0.5
    hy, hx = np.ogrid[:hh, :hw]
    hdist = np.sqrt((hx - hcx)**2 + (hy - hcy)**2)
    
    # Outer black background removal with smooth transition
    alpha = np.clip((brightness.astype(float) - 15) * 6, 0, 255).astype(np.uint8)
    # Circular hole in center for avatar
    alpha[hdist < hw * inner_rad_ratio] = 0
    
    # Smooth inner edge
    edge_blend = (hdist >= hw * (inner_rad_ratio - 0.015)) & (hdist < hw * inner_rad_ratio)
    alpha[edge_blend] = np.clip((hdist[edge_blend] - hw * (inner_rad_ratio - 0.015)) / (hw * 0.015) * 255, 0, 255).astype(np.uint8)
    
    hd_arr[:,:,3] = alpha
    png_img = Image.fromarray(hd_arr).resize((512, 512), Image.Resampling.LANCZOS)
    dst = os.path.join(out_dir, out_name)
    png_img.save(dst, "PNG")
    print(f"Saved: {dst}")

# Process all HD frames
process_hd_frame(
    r"C:\Users\ANH TUONG\.gemini\antigravity-ide\brain\28edc2c8-44fe-40c7-9eeb-f649b7a8fb5b\gold_crown_avatar_frame_1788077523089.jpg",
    "gold_frame.png",
    center_y_ratio=0.54,
    inner_rad_ratio=0.28
)

process_hd_frame(
    r"C:\Users\ANH TUONG\.gemini\antigravity-ide\brain\28edc2c8-44fe-40c7-9eeb-f649b7a8fb5b\silver_crown_avatar_frame_1788077542539.jpg",
    "silver_frame.png",
    center_y_ratio=0.55,
    inner_rad_ratio=0.29
)

process_hd_frame(
    r"C:\Users\ANH TUONG\.gemini\antigravity-ide\brain\28edc2c8-44fe-40c7-9eeb-f649b7a8fb5b\bronze_crown_avatar_frame_1788077557288.jpg",
    "bronze_frame.png",
    center_y_ratio=0.52,
    inner_rad_ratio=0.24
)

print("HD PROCESSING COMPLETE!")
