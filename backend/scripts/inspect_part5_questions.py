import sys
import json
from pymongo import MongoClient

sys.stdout.reconfigure(encoding='utf-8')
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

docs = list(db.readingexercises.find({
    '$or': [{'part': 5}, {'part': '5'}, {'part': 'Part 5'}, {'category': {'$regex': 'part 5|ngữ pháp', '$options': 'i'}}]
}))

print(f"Found {len(docs)} Part 5 / Grammar exercise documents in readingexercises.")

total_q = sum(len(d.get('questions', [])) for d in docs)
print(f"Total Part 5 questions available: {total_q}")

if docs:
    d0 = docs[0]
    print("Sample doc title:", d0.get('title'))
    if d0.get('questions'):
        q0 = d0['questions'][0]
        print("Keys:", list(q0.keys()))
        print("Prompt:", q0.get('prompt') or q0.get('promptText'))
        print("Options:", q0.get('options'))
        print("CorrectAnswer:", q0.get('correctAnswer'))
        print("Explanation snippet:", (q0.get('explanation') or '')[:120])

client.close()
