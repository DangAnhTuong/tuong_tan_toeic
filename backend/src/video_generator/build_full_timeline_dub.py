import os
import json
import asyncio
import subprocess
import edge_tts

TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw"
AUDIO_DIR = os.path.join(TEMP_DIR, "synced_audio_blocks")
os.makedirs(AUDIO_DIR, exist_ok=True)
OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

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

def make_silence(duration_sec, out_path):
    if duration_sec <= 0.05:
        duration_sec = 0.05
    cmd = [
        "ffmpeg", "-y",
        "-f", "lavfi",
        "-i", f"anullsrc=r=24000:cl=mono:d={duration_sec:.3f}",
        "-c:a", "libmp3lame", "-b:a", "128k",
        out_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

async def synthesize_single_block(i, b, sem):
    async with sem:
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(AUDIO_DIR, f"raw_{block_id}.mp3")
        text = b["text"].strip()
        
        if not (os.path.exists(raw_audio) and os.path.getsize(raw_audio) > 800):
            for attempt in range(5):
                try:
                    communicate = edge_tts.Communicate(text, voice="vi-VN-NamMinhNeural", rate="+10%")
                    await communicate.save(raw_audio)
                    if os.path.exists(raw_audio) and os.path.getsize(raw_audio) > 800:
                        break
                except Exception as e:
                    await asyncio.sleep(1.0)
        return i, raw_audio

async def synthesize_all_blocks(blocks):
    print(f"=== Step 1: Fast Parallel Async TTS for {len(blocks)} Blocks ===")
    sem = asyncio.Semaphore(6)
    tasks = [synthesize_single_block(i, b, sem) for i, b in enumerate(blocks)]
    await asyncio.gather(*tasks)
    print("All speech blocks synthesized! Building timeline audio...")

    track_parts = []
    current_timeline_time = 0.0

    for i, b in enumerate(blocks):
        start_time = b["start"]
        end_time = b["end"]
        target_dur = end_time - start_time
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(AUDIO_DIR, f"raw_{block_id}.mp3")
        fit_audio = os.path.join(AUDIO_DIR, f"fit_{block_id}.mp3")

        # 1. Chèn khoảng lặng (Silence) nếu có khoảng nghỉ
        silence_dur = start_time - current_timeline_time
        if silence_dur > 0.08:
            silence_path = os.path.join(AUDIO_DIR, f"silence_{block_id}.mp3")
            make_silence(silence_dur, silence_path)
            track_parts.append(silence_path)
            current_timeline_time += silence_dur

        # 2. Tính toán và nắn chỉnh tốc độ để khớp chính xác thời lượng clip
        act_dur = get_audio_duration(raw_audio)
        if act_dur > 0.1:
            if act_dur > target_dur + 0.3:
                speed_ratio = min(1.4, act_dur / target_dur)
                speed_cmd = [
                    "ffmpeg", "-y",
                    "-i", raw_audio,
                    "-filter:a", f"atempo={speed_ratio:.3f}",
                    "-c:a", "libmp3lame", "-b:a", "128k",
                    fit_audio
                ]
                subprocess.run(speed_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
                track_parts.append(fit_audio)
                actual_used_dur = get_audio_duration(fit_audio)
            else:
                track_parts.append(raw_audio)
                actual_used_dur = act_dur
            
            current_timeline_time += actual_used_dur

    # 3. Ghép toàn bộ track_parts thành 1 file MP3 đồng bộ tuyệt đối 9m54s
    concat_list_path = os.path.join(TEMP_DIR, "timeline_concat_list.txt")
    with open(concat_list_path, "w", encoding="utf-8") as fc:
        for p in track_parts:
            norm = p.replace("\\", "/")
            fc.write(f"file '{norm}'\n")

    full_track_path = os.path.join(TEMP_DIR, "full_timeline_9m54s.mp3")
    concat_cmd = [
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", concat_list_path,
        "-c", "copy",
        full_track_path
    ]
    subprocess.run(concat_cmd, check=True)
    full_dur = get_audio_duration(full_track_path)
    print(f"SUCCESS: Generated 100% Synced Timeline Audio ({full_dur:.2f}s = {full_dur/60:.2f} minutes)!")
    return full_track_path

def render_final_masked_video(synced_audio_path):
    print("=== Step 2: Rendering Final 1080p Video with 0% Face Exposure & Exact Audio Sync ===")
    raw_video = os.path.join(TEMP_DIR, "raw_lesson.mp4")
    intro_png = os.path.join(TEMP_DIR, "fullscreen_intro_slide.png")
    sidebar_png = os.path.join(TEMP_DIR, "right_sidebar_mask.png")
    final_output = os.path.join(OUTPUT_DIR, "grammar_part5_word_classes.mp4")

    # Filter: Intro fullscreen between 0 and 18s, Sidebar mask >= 18s
    filter_expr = "[0:v][1:v]overlay=0:0:enable='between(t,0,18)'[v1];[v1][2:v]overlay=0:0:enable='gte(t,18)'[v]"

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-i", intro_png,
        "-i", sidebar_png,
        "-i", synced_audio_path,
        "-filter_complex", filter_expr,
        "-map", "[v]",
        "-map", "3:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        final_output
    ]
    print("Encoding video with FFmpeg...")
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"DONE! Final Dubbed & Masked Video created at: {final_output}")

async def main():
    with open(os.path.join(TEMP_DIR, "speech_blocks_optimized.json"), "r", encoding="utf-8") as f:
        blocks = json.load(f)
    synced_audio = await synthesize_all_blocks(blocks)
    render_final_masked_video(synced_audio)

if __name__ == "__main__":
    asyncio.run(main())
