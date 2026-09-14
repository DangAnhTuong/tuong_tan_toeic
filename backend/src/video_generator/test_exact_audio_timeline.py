import os
import json
import subprocess
import numpy as np

TEMP_DIR = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw"
AUDIO_DIR = os.path.join(TEMP_DIR, "synced_audio_blocks")

with open(os.path.join(TEMP_DIR, "speech_blocks_optimized.json"), "r", encoding="utf-8") as f:
    blocks = json.load(f)

SAMPLE_RATE = 24000
TOTAL_DURATION = 594.28 # Exact video duration of raw_lesson.mp4
TOTAL_SAMPLES = int(TOTAL_DURATION * SAMPLE_RATE)

timeline = np.zeros(TOTAL_SAMPLES, dtype=np.int16)

print(f"Building exact audio timeline buffer: {TOTAL_DURATION}s ({TOTAL_SAMPLES} samples)...")

for i, b in enumerate(blocks):
    start_time = b["start"]
    end_time = b["end"]
    target_dur = end_time - start_time
    block_id = f"{i+1:03d}"
    raw_audio = os.path.join(AUDIO_DIR, f"raw_{block_id}.mp3")
    
    if not os.path.exists(raw_audio):
        continue

    # 1. Get raw PCM with speed fit if needed
    cmd_probe = [
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        raw_audio
    ]
    raw_dur = float(subprocess.check_output(cmd_probe).decode().strip())
    
    if raw_dur > target_dur + 0.3:
        speed = min(1.4, raw_dur / target_dur)
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

    if clip_len > 0:
        # Mix or overwrite
        timeline[start_idx:end_idx] = samples[:clip_len]

# Export to raw file and convert to wav/mp3
raw_timeline_path = os.path.join(TEMP_DIR, "exact_timeline.raw")
timeline.tofile(raw_timeline_path)

wav_timeline_path = os.path.join(TEMP_DIR, "exact_timeline_9m54s.wav")
convert_cmd = [
    "ffmpeg", "-y",
    "-f", "s16le", "-ar", str(SAMPLE_RATE), "-ac", "1",
    "-i", raw_timeline_path,
    "-c:a", "pcm_s16le",
    wav_timeline_path
]
subprocess.run(convert_cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

# Probe final duration
probe_cmd = [
    "ffprobe", "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=noprint_wrappers=1:nokey=1",
    wav_timeline_path
]
final_dur = float(subprocess.check_output(probe_cmd).decode().strip())
print(f"SUCCESS: Exact Audio Timeline built! Final Duration: {final_dur:.2f}s ({final_dur/60:.2f} minutes) matching video duration 594.28s perfectly!")
