import requests
import re
import json

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
}

url = 'https://www.scribd.com/embeds/515447322/content'
r = requests.get(url, headers=headers)
print('Status:', r.status_code)
print('Length:', len(r.text))

# Search for scribdassets or images or json
with open('a:/frontend/tuong_tan_toeic/backend/src/seed/embed_source.html', 'w', encoding='utf-8') as f:
    f.write(r.text)

matches = re.findall(r'https?://[^\s"\'<>]+(?:png|jpg|webp|svg)', r.text, re.IGNORECASE)
print('Found image/asset URLs:', len(matches))
for m in matches[:15]:
    print(m)

# Find script containing Scribd.embed_doc or similar
scripts = re.findall(r'<script[^>]*>(.*?)</script>', r.text, re.DOTALL)
print('Total scripts:', len(scripts))
for i, s in enumerate(scripts):
    if 'embed_doc' in s or 'scribdassets' in s or 'pageParams' in s or 'pages' in s:
        print(f'Script {i} matches! Length: {len(s)}')
        print(s[:500])
