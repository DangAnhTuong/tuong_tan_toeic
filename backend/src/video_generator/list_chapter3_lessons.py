import json
import sys

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

lessons = json.load(open('temp_dautoeic_raw/raw_video_lessons.json', encoding='utf-8'))
chapters = json.load(open('temp_dautoeic_raw/raw_video_chapters.json', encoding='utf-8'))

ch3_id = "873fc9d9-bb06-4b88-9765-2239022b2445"
ch3_lessons = [l for l in lessons if l.get('chapter_id') == ch3_id]
ch3_lessons.sort(key=lambda x: x.get('order_index', 0))

print(f"Total lessons in Chapter 3: {len(ch3_lessons)}")
for i, l in enumerate(ch3_lessons):
    print(f"{i+1:02d}. order={l.get('order_index')} title={l.get('title')} url={l.get('video_url')} duration={l.get('duration_seconds')}s")
