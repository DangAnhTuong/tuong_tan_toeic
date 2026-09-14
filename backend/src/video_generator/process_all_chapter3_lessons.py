import os
import sys
import json
import asyncio
import subprocess
import glob
import re

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')
    sys.stderr.reconfigure(encoding='utf-8')

from PIL import Image, ImageDraw, ImageFont
import numpy as np
import edge_tts

OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\frontend\public\videos"
BASE_DIR = r"a:\frontend\tuong_tan_toeic\backend"
TEMP_DIR = os.path.join(BASE_DIR, "temp_dautoeic_raw", "batch")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

CHAPTER3_LESSONS = [
    # 01..06 Already Completed
    {"num": 1, "id": "v5", "title": "Cách làm câu từ loại ở Part 5. Các hậu tố thường gặp", "url": "https://youtu.be/A46EQOoJcGc?si=KSM-7o5UTrkXsTC9", "output": "grammar_part5_word_classes.mp4"},
    {"num": 2, "id": "v6", "title": "Cách làm bài tập cụm danh từ", "url": "https://www.youtube.com/watch?v=GcrpCgL-hFU", "output": "grammar_part5_noun_phrases.mp4"},
    {"num": 3, "id": "v7", "title": "Bài tập vị trí danh từ", "url": "https://www.youtube.com/watch?v=1ZaCLji0zxc", "output": "grammar_part5_noun_positions.mp4"},
    {"num": 4, "id": "v8", "title": "(Nâng cao) Hai danh từ đứng cạnh nhau", "url": "https://www.youtube.com/watch?v=DtEQlM2wDRU", "output": "grammar_part5_compound_nouns.mp4"},
    {"num": 5, "id": "v9", "title": "(Nâng cao) Danh từ số ít không đứng một mình", "url": "https://www.youtube.com/watch?v=32ap6oXJzjg", "output": "grammar_part5_singular_nouns.mp4"},
    {"num": 6, "id": "v10", "title": "(Nâng cao) Danh từ đuôi -al và -ive", "url": "https://www.youtube.com/watch?v=XdWvmQXs-P4", "output": "grammar_part5_noun_suffixes_al_ive.mp4"},

    # 07..15: Đợt 2 (Danh từ nâng cao & Động từ các thì)
    {"num": 7, "id": "v11", "title": "Luyện tập xác định danh từ chính", "url": "https://www.youtube.com/watch?v=f_IW66YK5_Y", "output": "grammar_part5_identify_head_nouns.mp4"},
    {"num": 8, "id": "v12", "title": "Bài tập danh từ tổng hợp", "url": "https://www.youtube.com/watch?v=eetNAJRc-3U", "output": "grammar_part5_noun_exercises_part1.mp4"},
    {"num": 9, "id": "v13", "title": "Bài tập danh từ tổng hợp 2", "url": "https://www.youtube.com/watch?v=kkYieLyKPzY", "output": "grammar_part5_noun_exercises_part2.mp4"},
    {"num": 10, "id": "v14", "title": "Động từ số ít số nhiều cơ bản", "url": "https://www.youtube.com/watch?v=pmS-J9bytLE", "output": "grammar_part5_verb_singular_plural_basics.mp4"},
    {"num": 11, "id": "v15", "title": "5 dạng thức động từ, cách nhớ 12 thì", "url": "https://youtu.be/3eEAW7J1j1o", "output": "grammar_part5_verb_forms_12_tenses.mp4"},
    {"num": 12, "id": "v16", "title": "Luyện tập chia động từ 12 thì", "url": "https://www.youtube.com/watch?v=7pUwAlfuBdI", "output": "grammar_part5_verb_tenses_practice.mp4"},
    {"num": 13, "id": "v17", "title": "Bài tập tổng hợp về thì trong bài thi TOEIC", "url": "https://www.youtube.com/watch?v=7TM1qDmUGgM", "output": "grammar_part5_verb_tenses_mastery.mp4"},
    {"num": 14, "id": "v18", "title": "Luyện tập chia động từ ít nhiều nâng cao", "url": "https://youtu.be/HEGXyu_6kFM", "output": "grammar_part5_verb_advanced_agreement.mp4"},
    {"num": 15, "id": "v19", "title": "Bài tập chia động từ số ít số nhiều nâng cao", "url": "https://www.youtube.com/watch?v=GV_il7CJTt4", "output": "grammar_part5_verb_agreement_exercises.mp4"},

    # 16..25: Đợt 3 (Chủ động - Bị động & Tính từ - Trạng từ)
    {"num": 16, "id": "v20", "title": "Luyện tập chuyển động từ từ chủ động sang bị động", "url": "https://www.youtube.com/watch?v=S5VWeLCupUo", "output": "grammar_part5_passive_voice_transformation.mp4"},
    {"num": 17, "id": "v21", "title": "Cách làm bài tập dạng chủ động bị động", "url": "https://www.youtube.com/watch?v=lcGRKW95Kx8", "output": "grammar_part5_passive_voice_tactics.mp4"},
    {"num": 18, "id": "v22", "title": "Bài tập chủ động bị động", "url": "https://www.youtube.com/watch?v=1a9MKXUDKGI", "output": "grammar_part5_passive_voice_exercises.mp4"},
    {"num": 19, "id": "v23", "title": "4 vị trí tính từ đứng trước danh từ", "url": "https://www.youtube.com/watch?v=moww3_GFS_M", "output": "grammar_part5_adjective_positions_before_noun.mp4"},
    {"num": 20, "id": "v24", "title": "Tổng hợp vị trí tính từ sau động từ nối", "url": "https://www.youtube.com/watch?v=CWeKhasqJIg", "output": "grammar_part5_adjective_positions_after_linking_verbs.mp4"},
    {"num": 21, "id": "v25", "title": "Vị trí tính từ đặc biệt (dễ sai)", "url": "https://youtu.be/b9Ov0JklEyg", "output": "grammar_part5_special_adjective_positions.mp4"},
    {"num": 22, "id": "v26", "title": "Bài tập tổng hợp vị trí tính từ", "url": "https://youtu.be/T8EidOvA1BI", "output": "grammar_part5_adjective_positions_mastery.mp4"},
    {"num": 23, "id": "v27", "title": "3 vị trí trạng từ bổ nghĩa tính từ", "url": "https://www.youtube.com/watch?v=KTnALcJAyB8", "output": "grammar_part5_adverb_modifying_adjectives.mp4"},
    {"num": 24, "id": "v28", "title": "5 vị trí trạng từ bổ nghĩa động từ", "url": "https://www.youtube.com/watch?v=Gz4ZSLJZa9M", "output": "grammar_part5_adverb_modifying_verbs.mp4"},
    {"num": 25, "id": "v29", "title": "Bài tập tính từ và trạng từ", "url": "https://www.youtube.com/watch?v=kNpZuIZjSFM", "output": "grammar_part5_adjective_adverb_exercises.mp4"},

    # 26..35: Đợt 4 (Từ loại tổng hợp & Đại từ & Câu So Sánh)
    {"num": 26, "id": "v30", "title": "Bài tập từ loại", "url": "https://www.youtube.com/watch?v=HUlwuhMIX28", "output": "grammar_part5_word_form_exercises_part1.mp4"},
    {"num": 27, "id": "v31", "title": "Bài tập từ loại 2", "url": "https://youtu.be/5IiLBMKgjPI", "output": "grammar_part5_word_form_exercises_part2.mp4"},
    {"num": 28, "id": "v32", "title": "Cách làm bài tập đại từ nhân xưng và tính từ sở hữu", "url": "https://www.youtube.com/watch?v=8wxIEM01sKg", "output": "grammar_part5_personal_pronouns_possessive_adjectives.mp4"},
    {"num": 29, "id": "v33", "title": "Hiểu và chinh phục bài tập đại từ sở hữu", "url": "https://www.youtube.com/watch?v=ZhjLDxown7c", "output": "grammar_part5_possessive_pronouns.mp4"},
    {"num": 30, "id": "v34", "title": "3 vị trí thường gặp của đại từ phản thân", "url": "https://www.youtube.com/watch?v=vF6UmDidtl4", "output": "grammar_part5_reflexive_pronouns.mp4"},
    {"num": 31, "id": "v35", "title": "Bài tập đại từ tổng hợp TOEIC Part 5", "url": "", "output": "grammar_part5_pronouns_mastery.mp4"},
    {"num": 32, "id": "v36", "title": "Hiểu và chinh phục bài tập so sánh bằng", "url": "https://www.youtube.com/watch?v=1gzq44YDv3s", "output": "grammar_part5_comparative_equality.mp4"},
    {"num": 33, "id": "v37", "title": "Hiểu và chinh phục bài tập so sánh hơn của tính, trạng từ", "url": "https://www.youtube.com/watch?v=urJyhvoOTNQ", "output": "grammar_part5_comparative_superiority.mp4"},
    {"num": 34, "id": "v38", "title": "Cấu trúc và bài tập so sánh nhất trong Part 5", "url": "https://www.youtube.com/watch?v=eruE9HKAtmg", "output": "grammar_part5_comparative_superlative.mp4"},
    {"num": 35, "id": "v39", "title": "Bài tập câu so sánh tổng hợp Part 5 TOEIC", "url": "https://www.youtube.com/watch?v=4m1Xtt25HIQ", "output": "grammar_part5_comparative_exercises.mp4"},

    # 36..44: Đợt 5 (Liên từ - Giới từ & Mệnh đề quan hệ & Rút gọn)
    {"num": 36, "id": "v40", "title": "Liên từ tương quan (bài tập cho điểm)", "url": "https://www.youtube.com/watch?v=_HPXHlhqu2M", "output": "grammar_part5_correlative_conjunctions.mp4"},
    {"num": 37, "id": "v41", "title": "Bài tập về cấu trúc song song với liên từ and", "url": "https://www.youtube.com/watch?v=H6VIgRdRwqc", "output": "grammar_part5_parallel_structure_and.mp4"},
    {"num": 38, "id": "v42", "title": "Các dạng liên từ phụ thuộc, giới từ thường gặp", "url": "https://www.youtube.com/watch?v=lMsB_NBGo30", "output": "grammar_part5_subordinating_conjunctions_prepositions.mp4"},
    {"num": 39, "id": "v43", "title": "Bài tập liên từ và giới từ đồng nghĩa Part 5 TOEIC", "url": "https://www.youtube.com/watch?v=qVs5OAquFn4", "output": "grammar_part5_conjunctions_prepositions_exercises.mp4"},
    {"num": 40, "id": "v44", "title": "Các đại từ quan hệ, vị trí mệnh đề quan hệ", "url": "https://www.youtube.com/watch?v=8-A-pL-SyYw", "output": "grammar_part5_relative_pronouns_clauses.mp4"},
    {"num": 41, "id": "v45", "title": "Bài tập đại từ quan hệ", "url": "https://www.youtube.com/watch?v=mxO24oGO9Tc", "output": "grammar_part5_relative_clauses_exercises.mp4"},
    {"num": 42, "id": "v46", "title": "Cách rút gọn mệnh đề quan hệ", "url": "https://www.youtube.com/watch?v=PTSIqtSZLWw", "output": "grammar_part5_reduced_relative_clauses.mp4"},
    {"num": 43, "id": "v47", "title": "(Nâng cao) 3 bước làm nhanh bài tập rút gọn mệnh đề quan hệ Part 5 TOEIC", "url": "https://www.youtube.com/watch?v=GH8U_HhcyQ4", "output": "grammar_part5_advanced_reduced_relative_clauses.mp4"},
    {"num": 44, "id": "v48", "title": "Bài tập rút gọn mệnh đề quan hệ nâng cao", "url": "", "output": "grammar_part5_advanced_reduced_relative_exercises.mp4"}
]

PRONUNCIATION_MAP = {
    "-er": "đuôi ơ",
    "-or": "đuôi o",
    "-ee": "đuôi i",
    "-ist": "đuôi is",
    "-ian": "đuôi i-ân",
    "-ant": "đuôi an",
    "-tion": "đuôi sân",
    "-sion": "đuôi giần",
    "-ment": "đuôi mừn",
    "-ness": "đuôi nịt",
    "-ship": "đuôi síp",
    "-ty": "đuôi ti",
    "-cy": "đuôi xi",
    "-ure": "đuôi uốc",
    "-al": "đuôi o",
    "-ive": "đuôi iv",
    "-ous": "đuôi ợt",
    "-able": "đuôi ây-bồ",
    "-ible": "đuôi i-bồ",
    "-ful": "đuôi fun",
    "-less": "đuôi lịt",
    "-ic": "đuôi ích",
    "-ary": "đuôi a-ri",
    "-ate": "đuôi ết",
    "-ify": "đuôi i-phai",
    "-en": "đuôi en",
    "-ize": "đuôi ai",
    "-ise": "đuôi ai",
    "-ly": "đuôi li",
    "Part 5": "Part 5",
    "TOEIC": "Tô ích",
    "ETS": "E T S",
    "Noun Phrase": "Noun Phờ-rây-zơ",
    "Compound Noun": "Com-pao Nao",
    "representative": "rep-ri-zen-tơ-tiv",
    "proposal": "prờ-pâu-zồ",
    "approval": "ơ-pru-vồ",
    "initiative": "i-ni-sơ-tiv",
    "removal": "ri-mu-vồ"
}

def clean_speech_text(text):
    text = re.sub(r'\[.*?\]|\(.*?\)', '', text)
    for word, pron in PRONUNCIATION_MAP.items():
        text = text.replace(word, pron)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def parse_vtt_clean_sentences(vtt_file):
    if not os.path.exists(vtt_file):
        return []
    with open(vtt_file, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    events = []
    i = 0
    time_pat = re.compile(r'(\d{2}):(\d{2}):(\d{2}\.\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}\.\d{3})')
    
    def parse_sec(h, m, s):
        return int(h)*3600 + int(m)*60 + float(s)
        
    while i < len(lines):
        line = lines[i].strip()
        m = time_pat.search(line)
        if m:
            start_sec = parse_sec(m.group(1), m.group(2), m.group(3))
            end_sec = parse_sec(m.group(4), m.group(5), m.group(6))
            i += 1
            raw_text = ""
            while i < len(lines) and lines[i].strip() != "" and not time_pat.search(lines[i]):
                raw_text += " " + lines[i].strip()
                i += 1
            if '<c>' in raw_text or '</c>' in raw_text:
                clean_text = re.sub(r'<[^>]+>', '', raw_text).strip()
                if clean_text:
                    events.append({"start": start_sec, "end": end_sec, "text": clean_text})
        else:
            i += 1
            
    if not events:
        return []
        
    sentences = []
    cur_start = events[0]["start"]
    cur_words = []
    
    for ev in events:
        words = ev["text"].split()
        if not cur_words:
            cur_start = ev["start"]
            cur_words.extend(words)
        else:
            for w in words:
                if not cur_words or w != cur_words[-1]:
                    cur_words.append(w)
        
        cur_text = " ".join(cur_words)
        if len(cur_words) >= 8 or (cur_text and cur_text[-1] in '.?!'):
            sentences.append({
                "start": cur_start,
                "end": ev["end"],
                "text": cur_text
            })
            cur_words = []
            
    if cur_words:
        sentences.append({
            "start": cur_start,
            "end": events[-1]["end"],
            "text": " ".join(cur_words)
        })
        
    return sentences

def render_slide_image(output_path, title_text, subtitle_text, bullet_points):
    w, h = 1920, 1080
    im = Image.new("RGBA", (w, h), (10, 14, 26, 255))
    draw = ImageDraw.Draw(im)
    
    for y in range(0, h, 40):
        draw.line([(0, y), (w, y)], fill=(255, 255, 255, 6), width=1)
    for x in range(0, w, 40):
        draw.line([(x, 0), (x, h)], fill=(255, 255, 255, 6), width=1)
        
    for i in range(120):
        alpha = int(45 * (1 - i/120))
        draw.rounded_rectangle([60-i//3, 60-i//3, w-60+i//3, h-60+i//3], radius=24, outline=(0, 240, 255, alpha), width=1)
    draw.rounded_rectangle([60, 60, w-60, h-60], radius=20, fill=(15, 23, 42, 245), outline=(0, 240, 255, 200), width=3)
    
    badge_rect = [120, 100, 480, 150]
    draw.rounded_rectangle(badge_rect, radius=12, fill=(0, 102, 255, 220), outline=(0, 240, 255, 255), width=2)
    
    try:
        f_badge = ImageFont.truetype("arialbd.ttf", 22)
        f_title = ImageFont.truetype("arialbd.ttf", 46)
        f_sub = ImageFont.truetype("arial.ttf", 26)
        f_item = ImageFont.truetype("arial.ttf", 30)
    except:
        f_badge = f_title = f_sub = f_item = ImageFont.load_default()
        
    draw.text((140, 112), "TƯỜNG TẬN TOEIC - AI STUDIO", fill=(255, 255, 255), font=f_badge)
    draw.text((120, 180), title_text, fill=(255, 255, 255), font=f_title)
    draw.text((120, 245), subtitle_text, fill=(0, 240, 255), font=f_sub)
    draw.line([(120, 290), (w-120, 290)], fill=(0, 240, 255, 120), width=2)
    
    y_pos = 340
    for idx, bp in enumerate(bullet_points):
        draw.rounded_rectangle([120, y_pos, 160, y_pos+40], radius=8, fill=(0, 240, 255, 220))
        draw.text((132, y_pos+8), str(idx+1), fill=(10, 14, 26), font=f_badge)
        draw.text((180, y_pos+6), bp, fill=(240, 245, 255), font=f_item)
        y_pos += 75
        
    im.save(output_path, "PNG")

def create_sidebar_mask(output_path, title_text):
    w, h = 1920, 1080
    sidebar_w = 570
    x_start = w - sidebar_w
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    
    draw.rectangle([x_start, 0, w, h], fill=(13, 18, 32, 255))
    draw.line([(x_start, 0), (x_start, h)], fill=(0, 240, 255, 220), width=3)
    
    card_rect = [x_start + 25, 40, w - 25, 340]
    draw.rounded_rectangle(card_rect, radius=16, fill=(20, 28, 48, 255), outline=(0, 240, 255, 180), width=2)
    
    try:
        f_bold = ImageFont.truetype("arialbd.ttf", 22)
        f_sub = ImageFont.truetype("arial.ttf", 18)
    except:
        f_bold = f_sub = ImageFont.load_default()
        
    draw.rounded_rectangle([x_start + 45, 60, x_start + 230, 95], radius=8, fill=(0, 102, 255, 220))
    draw.text((x_start + 55, 68), "AI GIẢNG VIÊN TOEIC", fill=(255, 255, 255), font=f_bold)
    
    lines = []
    words = title_text.split()
    cur = ""
    for wrd in words:
        if len(cur + " " + wrd) < 26:
            cur = (cur + " " + wrd).strip()
        else:
            lines.append(cur)
            cur = wrd
    if cur: lines.append(cur)
    
    y_t = 115
    for l in lines[:3]:
        draw.text((x_start + 45, y_t), l, fill=(255, 255, 255), font=f_bold)
        y_t += 30
        
    draw.line([(x_start + 45, 215), (w - 45, 215)], fill=(0, 240, 255, 100), width=1)
    draw.text((x_start + 45, 235), "⚡ Giọng đọc AI: Nam Minh Studio", fill=(0, 240, 255), font=f_sub)
    draw.text((x_start + 45, 270), "🎯 Chuẩn đề thi TOEIC ETS Quốc Tế", fill=(160, 175, 205), font=f_sub)
    draw.text((x_start + 45, 305), "🎧 Nghe lại & tra từ vựng tức thì", fill=(160, 175, 205), font=f_sub)
    
    im.save(output_path, "PNG")

def scan_fullscreen_camera_intervals(thumbs_dir, total_seconds):
    cam_intervals = []
    in_cam = False
    start_c = 0
    
    for s in range(total_seconds):
        fn = os.path.join(thumbs_dir, f"frame_{s+1:04d}.png")
        if not os.path.exists(fn):
            continue
        try:
            with Image.open(fn) as im:
                crop = im.crop((15, 15, 75, 65)).convert("L")
                stat = np.array(crop)
                mean_val = np.mean(stat)
                if mean_val < 185.0:
                    if not in_cam:
                        in_cam = True
                        start_c = s
                else:
                    if in_cam:
                        in_cam = False
                        if (s - start_c) >= 3:
                            cam_intervals.append((start_c, s))
        except:
            pass
            
    if in_cam and (total_seconds - start_c) >= 3:
        cam_intervals.append((start_c, total_seconds))
        
    return cam_intervals

async def synthesize_single_sentence(i, s, audio_dir, sem):
    async with sem:
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(audio_dir, f"sent_{block_id}.mp3")
        text = clean_speech_text(s["text"])
        
        if os.path.exists(raw_audio) and os.path.getsize(raw_audio) < 100:
            try: os.remove(raw_audio)
            except: pass

        if not (os.path.exists(raw_audio) and os.path.getsize(raw_audio) >= 100):
            for attempt in range(5):
                try:
                    communicate = edge_tts.Communicate(text, voice="vi-VN-NamMinhNeural", rate="+2%")
                    await asyncio.wait_for(communicate.save(raw_audio), timeout=8.0)
                    if os.path.exists(raw_audio) and os.path.getsize(raw_audio) >= 100:
                        break
                except Exception:
                    if os.path.exists(raw_audio) and os.path.getsize(raw_audio) < 100:
                        try: os.remove(raw_audio)
                        except: pass
                    await asyncio.sleep(0.5)
        return i, raw_audio

async def process_single_lesson(lesson_info):
    num = lesson_info["num"]
    lesson_id = lesson_info["id"]
    title = lesson_info["title"]
    url = lesson_info["url"]
    output_filename = lesson_info["output"]
    
    if not url:
        print(f"[SKIP] Lesson {num} ({lesson_id}) has no video URL!")
        return

    final_output_path = os.path.join(OUTPUT_DIR, output_filename)
    if os.path.exists(final_output_path) and os.path.getsize(final_output_path) > 1000000:
        print(f"[SKIP] Lesson {num} video already rendered and ready: {final_output_path}")
        return

    lesson_dir = os.path.join(TEMP_DIR, f"ch3_{num:02d}_{lesson_id}")
    audio_dir = os.path.join(lesson_dir, "audio")
    thumbs_dir = os.path.join(lesson_dir, "thumbs")
    os.makedirs(audio_dir, exist_ok=True)
    os.makedirs(thumbs_dir, exist_ok=True)
    
    print(f"\n=======================================================")
    print(f"[PROCESSING LESSON {num}/44] {lesson_id} - {title}")
    print(f"URL: {url} -> Output: {output_filename}")
    print(f"=======================================================")
    
    # 1. Download Video & VTT
    raw_video = os.path.join(lesson_dir, "raw_video.mp4")
    vtt_file = os.path.join(lesson_dir, "raw_video.vi.vtt")
    
    if not (os.path.exists(raw_video) and os.path.getsize(raw_video) > 1000000):
        print("Downloading 1080p video...")
        cmd = ["yt-dlp", "-f", "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]", "--merge-output-format", "mp4", "-o", raw_video, url]
        subprocess.run(cmd, check=True)
        
    if not (os.path.exists(vtt_file) and os.path.getsize(vtt_file) > 100):
        print("Downloading VTT subtitles...")
        cmd_vtt = ["yt-dlp", "--write-auto-sub", "--sub-lang", "vi", "--skip-download", "-o", os.path.join(lesson_dir, "raw_video"), url]
        subprocess.run(cmd_vtt, check=True)

    # 2. Get Video Duration
    probe_cmd = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", raw_video]
    total_seconds = int(float(subprocess.check_output(probe_cmd).decode('utf-8').strip()))
    print(f"Video Duration: {total_seconds}s ({total_seconds/60:.2f}m)")

    # 3. Parse Subtitles
    sentences = parse_vtt_clean_sentences(vtt_file)
    print(f"Extracted {len(sentences)} 100% clean non-repeating sentences!")
    with open(os.path.join(lesson_dir, "clean_sentences.json"), "w", encoding="utf-8") as f:
        json.dump(sentences, f, ensure_ascii=False, indent=2)

    # 4. Generate Graphic Slides
    slide_intro = os.path.join(lesson_dir, "slide_intro.png")
    slide_topic = os.path.join(lesson_dir, "slide_topic.png")
    slide_outro = os.path.join(lesson_dir, "slide_outro.png")
    sidebar_mask = os.path.join(lesson_dir, "sidebar_mask.png")

    render_slide_image(
        slide_intro,
        f"BÀI {num}: {title.upper()}",
        "CHƯƠNG 3: NGỮ PHÁP PART 5 TOEIC",
        [
            "Làm chủ 100% kiến thức ngữ pháp trọng tâm đề thi thật",
            "Mẹo nhận diện nhanh đáp án trong 5-10 giây",
            "Luyện tập bài tập trắc nghiệm củng cố ngay sau bài giảng",
            "Hệ thống lồng tiếng & giảng dạy AI Studio độc quyền"
        ]
    )

    render_slide_image(
        slide_topic,
        "TRỌNG TÂM KIẾN THỨC BÀI HỌC",
        f"BÀI {num}: {title}",
        [
            "Ghi nhớ cấu trúc ngữ pháp và nguyên tắc áp dụng",
            "Nhận diện các dấu hiệu bẫy thường gặp trong đề thi",
            "Phân tích kỹ lưỡng các ví dụ và câu hỏi trích từ đề ETS",
            "Luyện phản xạ chọn đáp án chính xác tuyệt đối"
        ]
    )

    render_slide_image(
        slide_outro,
        "HOÀN THÀNH BÀI GIẢNG",
        "TIẾP TỤC LUYỆN TẬP TRẮC NGHIỆM CỦNG CỐ",
        [
            "Thực hành 5-10 câu trắc nghiệm ETS ngay bên dưới",
            "Xem giải thích chi tiết và dịch nghĩa từng câu",
            "Tự động tích lũy điểm kinh nghiệm XP & Streak học tập",
            "Chúc bạn ôn luyện đạt điểm mục tiêu TOEIC cao nhất!"
        ]
    )

    create_sidebar_mask(sidebar_mask, f"BÀI {num}: {title}")

    # 5. Extract 1fps frames and Scan for Fullscreen Camera
    if len(glob.glob(os.path.join(thumbs_dir, "*.png"))) < total_seconds - 5:
        print("Extracting 1fps thumbnails...")
        subprocess.run(["ffmpeg", "-y", "-i", raw_video, "-vf", "fps=1,scale=160:90", os.path.join(thumbs_dir, "frame_%04d.png")], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
    print("Scanning video frames to detect all fullscreen camera intervals...")
    cam_intervals = scan_fullscreen_camera_intervals(thumbs_dir, total_seconds)
    print(f"Detected {len(cam_intervals)} Fullscreen Camera intervals: {cam_intervals}")

    # 6. Synthesize Speech
    print(f"Synthesizing {len(sentences)} speech blocks...")
    sem = asyncio.Semaphore(6)
    tasks = [synthesize_single_sentence(i, s, audio_dir, sem) for i, s in enumerate(sentences)]
    await asyncio.gather(*tasks)

    # 7. Build Synced Audio Timeline (NumPy Buffer)
    sample_rate = 24000
    total_samples = int(total_seconds * sample_rate) + sample_rate * 2
    timeline_audio = np.zeros(total_samples, dtype=np.int16)

    for i, s in enumerate(sentences):
        block_id = f"{i+1:03d}"
        raw_audio = os.path.join(audio_dir, f"sent_{block_id}.mp3")
        if not os.path.exists(raw_audio):
            continue
            
        wav_audio = os.path.join(audio_dir, f"sent_{block_id}.wav")
        if not os.path.exists(wav_audio):
            subprocess.run(["ffmpeg", "-y", "-i", raw_audio, "-ar", str(sample_rate), "-ac", "1", "-f", "s16le", wav_audio], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
        if os.path.exists(wav_audio):
            data = np.fromfile(wav_audio, dtype=np.int16)
            start_sample = int(s["start"] * sample_rate)
            end_sample = start_sample + len(data)
            if end_sample <= len(timeline_audio):
                timeline_audio[start_sample:end_sample] = data
            else:
                avail = len(timeline_audio) - start_sample
                if avail > 0:
                    timeline_audio[start_sample:] = data[:avail]

    synced_audio_path = os.path.join(lesson_dir, "synced_audio.wav")
    timeline_audio.tofile(synced_audio_path)
    subprocess.run(["ffmpeg", "-y", "-f", "s16le", "-ar", str(sample_rate), "-ac", "1", "-i", synced_audio_path, os.path.join(lesson_dir, "synced_audio_fixed.wav")], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    synced_audio_path = os.path.join(lesson_dir, "synced_audio_fixed.wav")

    # 8. Multi-Stage FFmpeg Render
    intro_dur = 18
    outro_dur = 15
    outro_start = max(0, total_seconds - outro_dur)

    mid_conds = []
    all_cam_conds = [f"between(t,0,{intro_dur})", f"gte(t,{outro_start})"]
    for (cs, ce) in cam_intervals:
        if ce > intro_dur and cs < outro_start:
            eff_s = max(intro_dur, cs)
            eff_e = min(outro_start, ce)
            cond = f"between(t,{eff_s},{eff_e})"
            mid_conds.append(cond)
            all_cam_conds.append(cond)
            
    mid_cond_expr = "+".join(mid_conds) if mid_conds else "0"
    all_cam_expr = "+".join(all_cam_conds)

    v_chain = (
        f"[0:v][1:v]overlay=0:0:enable='between(t,0,{intro_dur})'[v1];"
        f"[v1][2:v]overlay=0:0:enable='{mid_cond_expr}'[v2];"
        f"[v2][3:v]overlay=0:0:enable='gte(t,{outro_start})'[v3];"
        f"[v3][4:v]overlay=0:0:enable='not({all_cam_expr})'[v]"
    )

    ffmpeg_cmd = [
        "ffmpeg", "-y",
        "-i", raw_video,
        "-i", slide_intro,
        "-i", slide_topic,
        "-i", slide_outro,
        "-i", sidebar_mask,
        "-i", synced_audio_path,
        "-filter_complex", v_chain,
        "-map", "[v]",
        "-map", "5:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "fast",
        "-c:a", "aac", "-b:a", "192k",
        "-shortest",
        final_output_path
    ]
    print("Encoding final video with FFmpeg...")
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"[SUCCESS] Video rendered at: {final_output_path}")

async def main():
    # Process all lessons in Chapter 3 sequentially
    for lesson in CHAPTER3_LESSONS:
        try:
            await process_single_lesson(lesson)
        except Exception as e:
            print(f"[ERROR] Failed processing lesson {lesson.get('num')}: {e}")

if __name__ == "__main__":
    asyncio.run(main())
