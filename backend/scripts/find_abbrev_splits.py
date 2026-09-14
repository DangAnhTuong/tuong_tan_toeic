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

bad_abbrev_re = re.compile(r'\b(Mr|Ms|Mrs|Dr|St|Prof|Corp|Inc|Ltd|Co|approx|dept|vs)\.\s*$', re.IGNORECASE)

bad_splits = []
for doc in docs:
    items = doc.get('questions') or doc.get('items') or []
    for idx, it in enumerate(items):
        tr = (it.get('transcript') or '').strip()
        if bad_abbrev_re.search(tr):
            bad_splits.append({
                'doc': doc['title'],
                'idx': idx,
                'tr': tr,
                'next_tr': items[idx+1].get('transcript') if idx+1 < len(items) else None
            })

print(f'Total bad abbreviation split sentences: {len(bad_splits)}')
for b in bad_splits[:20]:
    print(f"{b['doc']} [{b['idx']}]: {repr(b['tr'])} -> Next: {repr(b['next_tr'])}")
