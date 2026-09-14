import os
import sys
import re
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

def is_numeric_or_price_or_unit(text):
    s = text.strip()
    if not s:
        return True
    # Currency / numbers: $10, 10, 39.95, £20.00, 2:15, 14L, 9 inches
    if re.match(r'^[\$£€]?\s*\d+([.,]\d+)?\s*(inches|inch|L|P|S|G|%)?$', s, re.IGNORECASE):
        return True
    if re.match(r'^\d+:\d+$', s):
        return True
    return False

def translate_batch(words):
    """Translates a list of words/phrases using Google GTX API in one HTTP request."""
    if not words:
        return {}
    
    joined = '\n'.join(words)
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(joined)
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            translated_lines = ''.join(chunk[0] for chunk in data[0] if chunk[0]).split('\n')
            
            # Match back
            results = {}
            if len(translated_lines) == len(words):
                for w, t in zip(words, translated_lines):
                    results[w] = t.strip()
            else:
                # If newline splitting mismatch, fallback to individual
                for w in words:
                    results[w] = translate_single(w)
            return results
    except Exception as e:
        print(f"Batch failed ({e}), falling back to single translation for {len(words)} words...")
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
    print("🔌 Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI)
    db = client.get_default_database()
    col = db['readingexercises']

    # 1. Load existing dictionary caches if available
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(base_dir, '../data')
    
    known_dict = {}
    
    def load_cache(filename):
        fpath = os.path.join(data_dir, filename)
        if os.path.exists(fpath):
            try:
                with open(fpath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for k, v in data.items():
                        if isinstance(v, str) and v.strip():
                            known_dict[k.strip().lower()] = v.strip()
            except Exception as e:
                print(f"Warn: could not load {filename}: {e}")

    load_cache('persistent_translation_cache.json')
    load_cache('option_translation_cache.json')
    load_cache('curated_option_translations.json')
    print(f"📚 Loaded {len(known_dict)} terms from existing caches.")

    # 2. Scan all questions in readingexercises with "Phương án:"
    docs = list(col.find({'questions.options.translation': {'$regex': 'Phương án:', '$options': 'i'}}))
    print(f"🔍 Found {len(docs)} documents containing 'Phương án:' options.")

    # Collect all unique raw option texts
    unique_targets = set()
    total_options_to_heal = 0
    for doc in docs:
        for q in doc.get('questions', []):
            for opt in q.get('options', []):
                trans = opt.get('translation', '')
                if 'Phương án:' in trans:
                    raw = opt.get('text', '').strip()
                    unique_targets.add(raw)
                    total_options_to_heal += 1

    print(f"🎯 Total options to heal: {total_options_to_heal}")
    print(f"🎯 Total unique raw terms: {len(unique_targets)}")

    # 3. Resolve translations for each unique term
    resolved_dict = {}
    need_translate = []

    for raw in unique_targets:
        raw_clean = raw.strip()
        lower = raw_clean.lower()

        # Check special positions
        if raw_clean in ['[1]', 'Position [1]']:
            resolved_dict[raw] = 'Vị trí [1]'
        elif raw_clean in ['[2]', 'Position [2]']:
            resolved_dict[raw] = 'Vị trí [2]'
        elif raw_clean in ['[3]', 'Position [3]']:
            resolved_dict[raw] = 'Vị trí [3]'
        elif raw_clean in ['[4]', 'Position [4]']:
            resolved_dict[raw] = 'Vị trí [4]'
        elif is_numeric_or_price_or_unit(raw_clean):
            # Clean number/price as-is
            resolved_dict[raw] = raw_clean
        elif lower in known_dict and not known_dict[lower].startswith('Phương án:'):
            resolved_dict[raw] = known_dict[lower]
        else:
            need_translate.append(raw)

    print(f"✨ Immediately resolved (numbers, positions, cache): {len(resolved_dict)}")
    print(f"🌐 Need external translation: {len(need_translate)}")

    # 4. Translate remainder in batches of 30
    batch_size = 30
    for i in range(0, len(need_translate), batch_size):
        chunk = need_translate[i:i + batch_size]
        print(f"Translating chunk {i // batch_size + 1}/{(len(need_translate) + batch_size - 1) // batch_size} ({len(chunk)} words)...")
        translated_map = translate_batch(chunk)
        for w, trans in translated_map.items():
            resolved_dict[w] = trans
        time.sleep(0.15)

    # Save resolved dict
    dict_out_path = os.path.join(base_dir, 'phuongan_resolved_dictionary.json')
    with open(dict_out_path, 'w', encoding='utf-8') as f:
        json.dump(resolved_dict, f, ensure_ascii=False, indent=2)
    print(f"💾 Saved full dictionary with {len(resolved_dict)} entries to {dict_out_path}")

    # 5. Apply to MongoDB
    total_healed = 0
    updated_docs = 0

    for doc in docs:
        doc_modified = False
        questions = doc.get('questions', [])

        for q in questions:
            q_modified = False
            for opt in q.get('options', []):
                trans = opt.get('translation', '')
                if 'Phương án:' in trans:
                    raw = opt.get('text', '').strip()
                    healed_trans = resolved_dict.get(raw, raw)
                    opt['translation'] = healed_trans
                    opt['vietnamese'] = healed_trans
                    q_modified = True
                    total_healed += 1

            if q_modified:
                if q.get('explanation') and 'Phương án:' in q['explanation']:
                    q['explanation'] = q['explanation'].replace('Phương án: ', '').replace('Phương án:', '')
                doc_modified = True

        if doc_modified:
            col.update_one({'_id': doc['_id']}, {'$set': {'questions': questions}})
            updated_docs += 1
            print(f"✅ Updated doc: {doc.get('title')} ({doc.get('part')} Lv{doc.get('level')})")

    # 6. Verification
    remaining_count = col.count_documents({'questions.options.translation': {'$regex': 'Phương án:', '$options': 'i'}})
    print("\n" + "=" * 50)
    print("🎉 ALL 'PHƯƠNG ÁN:' OPTIONS HAVE BEEN PURIFIED!")
    print(f"- Total options healed: {total_healed}")
    print(f"- Documents updated: {updated_docs}")
    print(f"- Remaining 'Phương án:' in readingexercises: {remaining_count}")
    print(f"- Time elapsed: {time.time() - start_time:.1f}s")
    print("=" * 50)

if __name__ == '__main__':
    main()
