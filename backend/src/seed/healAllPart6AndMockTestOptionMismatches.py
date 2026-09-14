import os
import sys
import json
import time
import urllib.parse
import urllib.request
from pymongo import MongoClient

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017/tuong_tan_toeic')

def translate_batch(words):
    if not words:
        return {}
    joined = '\n'.join(words)
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(joined)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            translated_lines = ''.join(chunk[0] for chunk in data[0] if chunk[0]).split('\n')
            results = {}
            if len(translated_lines) == len(words):
                for w, t in zip(words, translated_lines):
                    results[w] = t.strip()
            else:
                for w in words:
                    results[w] = translate_single(w)
            return results
    except Exception as e:
        print(f"Batch failed ({e}), falling back to single...")
        results = {}
        for w in words:
            results[w] = translate_single(w)
            time.sleep(0.05)
        return results

def translate_single(text):
    s = text.strip()
    if not s:
        return ''
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(s)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return ''.join(chunk[0] for chunk in data[0] if chunk[0]).strip()
    except Exception:
        return s

def main():
    start_time = time.time()
    base_dir = os.path.dirname(os.path.abspath(__file__))
    targets_file = os.path.join(base_dir, 'targets_need_translation.json')
    phuongan_dict_file = os.path.join(base_dir, 'phuongan_resolved_dictionary.json')

    master_dict = {}
    if os.path.exists(phuongan_dict_file):
        with open(phuongan_dict_file, 'r', encoding='utf-8') as f:
            for k, v in json.load(f).items():
                master_dict[k.strip()] = v.strip()

    with open(targets_file, 'r', encoding='utf-8') as f:
        need_translate = json.load(f)

    print(f"🌐 Need translation for {len(need_translate)} target terms...")

    batch_size = 25
    for i in range(0, len(need_translate), batch_size):
        chunk = need_translate[i:i + batch_size]
        print(f"Translating batch {i // batch_size + 1}/{(len(need_translate) + batch_size - 1) // batch_size} ({len(chunk)} items)...")
        res = translate_batch(chunk)
        for w, trans in res.items():
            master_dict[w] = trans
        time.sleep(0.15)

    # Save updated dictionary
    out_dict_path = os.path.join(base_dir, 'master_healed_options_dict.json')
    with open(out_dict_path, 'w', encoding='utf-8') as f:
        json.dump(master_dict, f, ensure_ascii=False, indent=2)
    print(f"💾 Master dictionary saved with {len(master_dict)} items.")

    # Apply to MongoDB
    print("🔌 Connecting to MongoDB to heal questions...")
    client = MongoClient(MONGODB_URI)
    db = client.get_default_database()

    total_options_healed = 0
    total_docs_updated = 0

    collections = ['mocktests', 'readingexercises']
    for cname in collections:
        col = db[cname]
        docs = list(col.find({}))
        print(f"Auditing & healing collection: {cname} ({len(docs)} documents)...")

        for doc in docs:
            doc_modified = False
            questions = doc.get('questions', [])

            for q in questions:
                for opt in q.get('options', []):
                    raw_text = (opt.get('text') or '').strip()
                    trans = (opt.get('translation') or '').strip()
                    text_words = len(raw_text.split())
                    trans_words = len(trans.split())

                    # Check Case 1: English sentence (>= 4 words) translated to 1-2 words
                    is_case_1 = text_words >= 4 and trans_words <= 2

                    # Check Case 2: Short English word (<= 2 words) translated to conversational sentence (>= 6 words, not dictionary notation)
                    is_dictionary_style = any(p in trans.lower() for p in ['(v)', '(n)', '(adj)', '(adv)', '(prep)', '(pron)', '(conj)', 'giới từ', 'danh từ', 'động từ', 'tính từ', 'trạng từ'])
                    is_case_2 = text_words <= 2 and trans_words >= 6 and not is_dictionary_style and (trans.endswith('.') or ' sẽ ' in trans or ' chúng tôi ' in trans or ' họ ' in trans)

                    if is_case_1 or is_case_2:
                        # Find best translation
                        clean_trans = master_dict.get(raw_text) or master_dict.get(raw_text.lower())
                        if clean_trans:
                            opt['translation'] = clean_trans
                            opt['vietnamese'] = clean_trans
                            doc_modified = True
                            total_options_healed += 1

            if doc_modified:
                col.update_one({'_id': doc['_id']}, {'$set': {'questions': questions}})
                total_docs_updated += 1
                title = doc.get('title') or doc.get('code')
                print(f"  ✅ Healed: {title}")

    print("\n" + "=" * 60)
    print("🎉 MASTER HEALING COMPLETE!")
    print(f"- Total options healed: {total_options_healed}")
    print(f"- Total documents updated: {total_docs_updated}")
    print(f"- Time elapsed: {time.time() - start_time:.1f}s")
    print("=" * 60)

if __name__ == '__main__':
    main()
