import sys, re
from pymongo import MongoClient

sys.stdout.reconfigure(encoding='utf-8')

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

docs = list(db['listeningexercises'].find({
    '$or': [
        {'mode': 'dictation'},
        {'type': 'dictation'},
        {'category': 'dictation'},
        {'title': {'$regex': 'chép chính tả|dictation', '$options': 'i'}}
    ]
}))

SPEAKER_START_RE = re.compile(r'^([A-Za-z]{1,2}-[A-Za-z]{2,3}|Man|Woman|Speaker)\s*:\s*', re.IGNORECASE)
SPEAKER_END_RE = re.compile(r'\s*([A-Za-z]{1,2}-[A-Za-z]{2,3}|Man|Woman|Speaker)\s*:\s*$', re.IGNORECASE)

cleaned_samples = []

for doc in docs:
    items = doc.get('questions') or doc.get('items') or []
    for idx, item in enumerate(items):
        en = (item.get('transcript') or item.get('dictationText') or '').strip()
        has_start = bool(SPEAKER_START_RE.search(en))
        has_end = bool(SPEAKER_END_RE.search(en))
        if has_start or has_end:
            cleaned = SPEAKER_START_RE.sub('', en)
            cleaned = SPEAKER_END_RE.sub('', cleaned).strip()
            cleaned_samples.append({
                'doc': doc['title'],
                'idx': idx,
                'original': en,
                'cleaned': cleaned
            })

print(f'Total sentences needing speaker tag cleanup: {len(cleaned_samples)}')
for s in cleaned_samples[:10]:
    print(f"Original: {repr(s['original'])} -> Cleaned: {repr(s['cleaned'])}")
