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

mismatched_audios = 0
matches = 0

for doc in docs:
    items = doc.get('questions') or doc.get('items') or []
    for idx in range(len(items) - 1):
        tr = (items[idx].get('transcript') or '').strip()
        if bad_abbrev_re.search(tr):
            a1 = items[idx].get('audioUrl')
            a2 = items[idx+1].get('audioUrl')
            if a1 == a2:
                matches += 1
            else:
                mismatched_audios += 1
                print(f"Mismatch in {doc['title']}: {a1} vs {a2}")

print(f"Total abbreviation splits: {matches + mismatched_audios}, Same audio: {matches}, Mismatched: {mismatched_audios}")
