from pymongo import MongoClient

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

topics = list(db.vocabularytopics.find({}))
count = 0

for t in topics:
    modified = False
    for w in t.get('words', []):
        if w.get('word', '').strip().lower() == 'route' and not w.get('phonetic'):
            w['phonetic'] = '/ruːt/'
            modified = True
            count += 1
    for p in t.get('parts', []):
        for w in p.get('words', []):
            if w.get('word', '').strip().lower() == 'route' and not w.get('phonetic'):
                w['phonetic'] = '/ruːt/'
                modified = True
                count += 1
    if modified:
        db.vocabularytopics.update_one({'_id': t['_id']}, {'$set': {'words': t.get('words', []), 'parts': t.get('parts', [])}})

print(f"Successfully updated phonetic for {count} occurrences of 'Route'")
client.close()
