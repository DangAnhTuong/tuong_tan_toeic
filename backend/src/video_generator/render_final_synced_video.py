import os
import subprocess

TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw"
OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"

raw_video = os.path.join(TEMP_DIR, "raw_lesson.mp4")
intro_png = os.path.join(TEMP_DIR, "fullscreen_intro_slide.png")
sidebar_png = os.path.join(TEMP_DIR, "right_sidebar_mask.png")
synced_audio = os.path.join(TEMP_DIR, "exact_timeline_9m54s.wav")
final_output = os.path.join(OUTPUT_DIR, "grammar_part5_word_classes.mp4")

filter_expr = "[0:v][1:v]overlay=0:0:enable='between(t,0,18)'[v1];[v1][2:v]overlay=0:0:enable='gte(t,18)'[v]"

ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-i", raw_video,
    "-i", intro_png,
    "-i", sidebar_png,
    "-i", synced_audio,
    "-filter_complex", filter_expr,
    "-map", "[v]",
    "-map", "3:a",
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
    "-c:a", "aac", "-b:a", "192k",
    "-shortest",
    final_output
]

print("Rendering final video with FFmpeg...")
subprocess.run(ffmpeg_cmd, check=True)
print(f"SUCCESS: Final Dubbed & Masked Video rendered at: {final_output}")
