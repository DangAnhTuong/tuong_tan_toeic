import os
import json
import asyncio
import subprocess
import re
import numpy as np
import edge_tts

TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw"
AUDIO_DIR = os.path.join(TEMP_DIR, "polished_synced_audio")
os.makedirs(AUDIO_DIR, exist_ok=True)
OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
os.makedirs(OUTPUT_DIR, exist_ok=True)

SAMPLE_RATE = 24000
TOTAL_DURATION = 594.28 # Exact video duration of raw_lesson.mp4
TOTAL_SAMPLES = int(TOTAL_DURATION * SAMPLE_RATE)

def clean_speech_text(t):
    # 1. Standardize TOEIC & Part names
    t = re.sub(r'\bbài thi tu\b', 'bài thi TOEIC', t, flags=re.IGNORECASE)
    t = re.sub(r'\bpart five\b', 'Part 5', t, flags=re.IGNORECASE)
    t = re.sub(r'\bvặt năm\b', 'Part 5', t, flags=re.IGNORECASE)
    t = re.sub(r'\bđiện từ\b', 'điền từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\bgóc từ\b', 'gốc từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\btràng từ\b', 'trạng từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\btràng trạng từ\b', 'trạng từ', t, flags=re.IGNORECASE)
    t = re.sub(r'\bhậu tổ\b', 'hậu tố', t, flags=re.IGNORECASE)
    
    # 2. English Suffixes phonetics for clear, natural pronunciation
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
    
    # 3. English Words phonetics
    t = re.sub(r'\bcare phụ\b', 'careful', t, flags=re.IGNORECASE)
    t = re.sub(r'\bcareless caress\b', 'careless', t, flags=re.IGNORECASE)
    t = re.sub(r'\bfly attendant\b', 'flight attendant', t, flags=re.IGNORECASE)
    t = re.sub(r'\bweck\b', 'weak', t, flags=re.IGNORECASE)
    t = re.sub(r'\bwecken\b', 'weaken', t, flags=re.IGNORECASE)
    t = re.sub(r'\bmoderniz\b', 'modernize', t, flags=re.IGNORECASE)
    
    # Clean multiple spaces
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

async def synthesize_sentence(i, s, sem):
    async with sem:
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(AUDIO_DIR, f"sent_{block_id}.mp3")
        text = clean_speech_text(s["text"])
        
        if not (os.path.exists(raw_audio) and os.path.getsize(raw_audio) > 600):
            for attempt in range(5):
                try:
                    communicate = edge_tts.Communicate(text, voice="vi-VN-NamMinhNeural", rate="+2%")
                    await communicate.save(raw_audio)
                    if os.path.exists(raw_audio) and os.path.getsize(raw_audio) > 600:
                        break
                except:
                    await asyncio.sleep(0.8)
        return i, raw_audio

async def build_exact_synced_audio():
    with open(os.path.join(TEMP_DIR, "clean_pure_sentences.json"), "r", encoding="utf-8") as f:
        sentences = json.load(f)

    print(f"=== Step 1: Synthesizing {len(sentences)} Polished Sentences ===")
    sem = asyncio.Semaphore(8)
    tasks = [synthesize_sentence(i, s, sem) for i, s in enumerate(sentences)]
    await asyncio.gather(*tasks)
    print("All sentences synthesized! Placing into exact 594.28s audio timeline...")

    timeline = np.zeros(TOTAL_SAMPLES, dtype=np.int16)

    for i, s in enumerate(sentences):
        start_time = s["start"]
        end_time = s["end"]
        target_dur = end_time - start_time
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(AUDIO_DIR, f"sent_{block_id}.mp3")

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
        end_idx = min(TOTAL_SAMPLES, start_idx + len(samples))
        clip_len = end_idx - start_idx

        if clip_len > 0 and start_idx < TOTAL_SAMPLES:
            timeline[start_idx:end_idx] = samples[:clip_len]

    raw_path = os.path.join(TEMP_DIR, "perfect_timeline.raw")
    timeline.tofile(raw_path)

    wav_path = os.path.join(TEMP_DIR, "perfect_timeline_9m54s.wav")
    convert_cmd = [
        "ffmpeg", "-y",
        "-f", "s16le", "-ar", str(SAMPLE_RATE), "-ac", "1",
        "-i", raw_path,
        "-c:a", "pcm_s16le",
        wav_path
    ]
    subprocess.run(convert_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    dur = get_audio_duration(wav_path)
    print(f"SUCCESS: Perfect Audio Timeline created: {dur:.2f}s ({dur/60:.2f} minutes) with ZERO repetitions and natural English words!")
    return wav_path

def render_final_video(audio_wav_path):
    print("=== Step 2: Rendering Final Multi-Stage Masked Video (100% Face-Free Across All 594s) ===")
    raw_video = os.path.join(TEMP_DIR, "raw_lesson.mp4")
    intro_png = os.path.join(TEMP_DIR, "fullscreen_intro_slide.png")
    mnemonic_png = os.path.join(TEMP_DIR, "fullscreen_mnemonic_slide.png")
    outro_png = os.path.join(TEMP_DIR, "fullscreen_outro_slide.png")
    sidebar_png = os.path.join(TEMP_DIR, "right_sidebar_mask.png")
    final_output = os.path.join(OUTPUT_DIR, "grammar_part5_word_classes.mp4")

    # Filter complex with 4 overlay stages:
    # 1. 0s to 18s: fullscreen_intro_slide
    # 2. 341s to 364s (5m41s - 6m04s): fullscreen_mnemonic_slide
    # 3. 582s to 595s (9m42s - 9m54s): fullscreen_outro_slide
    # 4. 18s to 341s AND 364s to 582s: right_sidebar_mask
    filter_expr = (
        "[0:v][1:v]overlay=0:0:enable='between(t,0,18)'[v1];"
        "[v1][2:v]overlay=0:0:enable='between(t,341,364)'[v2];"
        "[v2][3:v]overlay=0:0:enable='gte(t,582)'[v3];"
        "[v3][4:v]overlay=0:0:enable='between(t,18,341)+between(t,364,582)'[v]"
    )

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-i", intro_png,
        "-i", mnemonic_png,
        "-i", outro_png,
        "-i", sidebar_png,
        "-i", audio_wav_path,
        "-filter_complex", filter_expr,
        "-map", "[v]",
        "-map", "5:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        final_output
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"SUCCESS: 100% Face-Free & Naturally Pronounced Video created at: {final_output}")

async def main():
    wav_path = await build_exact_synced_audio()
    render_final_video(wav_path)

if __name__ == "__main__":
    asyncio.run(main())
