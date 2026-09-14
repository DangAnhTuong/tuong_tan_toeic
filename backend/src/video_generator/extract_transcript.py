import urllib.request
import re
import json
import xml.etree.ElementTree as ET
import os

url = 'https://www.youtube.com/watch?v=C3lvL1tgf-M'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')

    match = re.search(r'"captionTracks":\s*(\[.*?\])', html)
    if match:
        tracks = json.loads(match.group(1))
        print('Found tracks:', len(tracks))
        for t in tracks:
            base_url = t.get('baseUrl')
            if base_url:
                sub_req = urllib.request.Request(base_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(sub_req) as sub_res:
                    xml_data = sub_res.read().decode('utf-8')
                    root = ET.fromstring(xml_data)
                    lines = []
                    for p in root.findall('text'):
                        start = p.get('start')
                        dur = p.get('dur')
                        text = p.text or ''
                        # Clean html entities
                        text = text.replace('&amp;', '&').replace('&#39;', "'").replace('&quot;', '"')
                        lines.append(f"[{start}s - {dur}s] {text}")
                    
                    os.makedirs('temp_video_assets', exist_ok=True)
                    out_path = 'temp_video_assets/transcript_full.txt'
                    with open(out_path, 'w', encoding='utf-8') as f:
                        f.write('\n'.join(lines))
                    print(f'Total caption lines: {len(lines)}')
                    print(f'Transcript saved to {out_path}!')
                    break
    else:
        print('captionTracks pattern not matched')
except Exception as e:
    print('Error:', e)
