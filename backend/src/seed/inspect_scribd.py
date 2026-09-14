import re
import json

path = r'C:\Users\ANH TUONG\.gemini\antigravity-ide\brain\00e3e944-e350-4a57-8480-065f414c76c3\.system_generated\steps\1730\content.md'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

print('Length:', len(text))
matches = re.findall(r'https?://[^\s"\'<>]+', text)
print('Total URLs found:', len(matches))
scribd_urls = [u for u in set(matches) if 'scribd' in u]
for u in scribd_urls[:40]:
    print(u)

# Find document ID or hashes
doc_keys = re.findall(r'document_id|doc_id|page_\d+|html\.scribdassets\.com', text, re.IGNORECASE)
print('Key tokens found:', set(doc_keys))
