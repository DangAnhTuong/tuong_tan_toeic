import sys
from pymongo import MongoClient
sys.stdout.reconfigure(encoding='utf-8')

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']
doc = db['listeningexercises'].find_one({'title': 'TEST 5 2024 — Part 3'})
items = doc.get('questions') or doc.get('items') or []
for idx in [55, 56, 57, 69, 70, 71, 83, 84, 85]:
    if idx < len(items):
        it = items[idx]
        print(f"Idx {idx}: {repr(it.get('transcript'))} | trans: {repr(it.get('translation'))} | audio: {it.get('audioUrl')}")
