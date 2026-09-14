import urllib.request
import re
import json

url = 'https://www.youtube.com/watch?v=C3lvL1tgf-M'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

with urllib.request.urlopen(req) as response:
    html = response.read().decode('utf-8')

match = re.search(r'"captionTracks":\s*(\[.*?\])', html)
if match:
    tracks = json.loads(match.group(1))
    base_url = tracks[0].get('baseUrl')
    print('Base URL:', base_url)
    
    # Request with fmt=json3
    json_url = base_url + '&fmt=json3'
    sub_req = urllib.request.Request(json_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(sub_req) as sub_res:
        raw = sub_res.read().decode('utf-8')
        data = json.loads(raw)
        events = data.get('events', [])
        print('Events count:', len(events))
        full_text_list = []
        for ev in events:
            segs = ev.get('segs', [])
            t = ''.join([s.get('utf8', '') for s in segs]).strip()
            if t:
                full_text_list.append(t)
        
        full_text = ' '.join(full_text_list)
        with open('temp_video_assets/dautoeic_lesson1_transcript.txt', 'w', encoding='utf-8') as f:
            f.write(full_text)
        print('Total words in transcript:', len(full_text.split()))
        print('First 300 chars of transcript:', full_text[:300])
