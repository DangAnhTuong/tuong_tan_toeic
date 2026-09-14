import sys, time, requests
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

sentences_to_translate = []
for doc in docs:
    items = doc.get('questions') or doc.get('items') or []
    for item in items:
        vi = (item.get('translation') or '').strip()
        en = (item.get('transcript') or item.get('dictationText') or '').strip()
        if vi in ['Phương án phản hồi Part 2.', 'Lời thoại đoạn hội thoại Part 3.']:
            sentences_to_translate.append(en)

unique_sentences = list(dict.fromkeys(sentences_to_translate))
print(f"Total placeholder items: {len(sentences_to_translate)}")
print(f"Total unique English sentences to translate: {len(unique_sentences)}")

# Test translation on first 50 unique sentences
t0 = time.time()
batch = unique_sentences[:50]
joined = '\n'.join(batch)
url = 'https://translate.googleapis.com/translate_a/single'
params = {'client': 'dict-chrome-ex', 'sl': 'en', 'tl': 'vi', 'dt': 't', 'q': joined}
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
r = requests.get(url, params=params, headers=headers, timeout=10)
data = r.json()
full_trans = ''.join([item[0] for item in data[0]])
translated_lines = [line.strip() for line in full_trans.split('\n') if line.strip()]
t1 = time.time()

print(f"Translated 50 sentences in {t1 - t0:.2f} seconds! Returned {len(translated_lines)} lines.")
print("Sample translations:")
for orig, trans in zip(batch[:5], translated_lines[:5]):
    print(f"  {orig} -> {trans}")
