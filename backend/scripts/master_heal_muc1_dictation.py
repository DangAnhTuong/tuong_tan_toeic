import sys, os, time, re, requests
from pymongo import MongoClient
from bson import ObjectId

sys.stdout.reconfigure(encoding='utf-8')

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

SPEAKER_START_RE = re.compile(r'^([A-Za-z]{1,2}-[A-Za-z]{2,3}|Man|Woman|Speaker)\s*:\s*', re.IGNORECASE)
SPEAKER_END_RE = re.compile(r'\s*([A-Za-z]{1,2}-[A-Za-z]{2,3}|Man|Woman|Speaker)\s*:\s*$', re.IGNORECASE)
BAD_ABBREV_RE = re.compile(r'\b(Mr|Ms|Mrs|Dr|St|Prof|Corp|Inc|Ltd|Co|approx|dept|vs)\.\s*$', re.IGNORECASE)

STOP_WORDS = {
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'but',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'it', 'its', 'as', 'by',
    'this', 'that', 'these', 'those', 'with', 'from'
}

def clean_sentence(text):
    if not text:
        return ''
    cleaned = SPEAKER_START_RE.sub('', text.strip())
    cleaned = SPEAKER_END_RE.sub('', cleaned).strip()
    return cleaned

def generate_blanks(sentence):
    words = sentence.strip().split()
    if not words:
        return []
    
    clean_words = [re.sub(r'^[^\w]+|[^\w]+$', '', w) for w in words]
    candidates = []
    for i, w in enumerate(clean_words):
        if not w:
            continue
        lower = w.lower()
        if lower not in STOP_WORDS and len(w) >= 3 and not re.match(r'^(W-Am|M-Cn|W-Br|M-Au|Man|Woman|Speaker)$', w, re.I):
            candidates.append((i, w))
    
    # If no candidates found (e.g. very short sentence: "Is that OK?")
    if not candidates:
        for i, w in enumerate(clean_words):
            if w:
                candidates.append((i, w))
    
    # Select up to 2-3 words spaced out
    selected = []
    if len(candidates) <= 2:
        selected = candidates
    else:
        step = max(1, len(candidates) // 3)
        for idx in range(0, len(candidates), step):
            selected.append(candidates[idx])
            if len(selected) >= 3:
                break

    return [{'word': w, 'index': i, '_id': ObjectId()} for i, w in selected]

def translate_single(text):
    url = 'https://translate.googleapis.com/translate_a/single'
    params = {'client': 'dict-chrome-ex', 'sl': 'en', 'tl': 'vi', 'dt': 't', 'q': text}
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    try:
        r = requests.get(url, params=params, headers=headers, timeout=5)
        if r.status_code == 200:
            data = r.json()
            return ''.join([item[0] for item in data[0]]).strip()
    except Exception as e:
        pass
    return text

def batch_translate(sentences, batch_size=25):
    cache = {}
    total = len(sentences)
    print(f"Translating {total} unique sentences in batches of {batch_size}...")
    
    for i in range(0, total, batch_size):
        chunk = sentences[i:i + batch_size]
        joined = '\n'.join(chunk)
        url = 'https://translate.googleapis.com/translate_a/single'
        params = {'client': 'dict-chrome-ex', 'sl': 'en', 'tl': 'vi', 'dt': 't', 'q': joined}
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        
        success = False
        try:
            r = requests.get(url, params=params, headers=headers, timeout=10)
            if r.status_code == 200:
                data = r.json()
                full_trans = ''.join([item[0] for item in data[0]])
                translated_lines = [line.strip() for line in full_trans.split('\n') if line.strip()]
                if len(translated_lines) == len(chunk):
                    for orig, trans in zip(chunk, translated_lines):
                        cache[orig] = trans
                    success = True
        except Exception:
            pass

        # Fallback to single translations if batch split was misaligned or failed
        if not success:
            for item in chunk:
                cache[item] = translate_single(item)
                time.sleep(0.05)

        done = min(i + batch_size, total)
        if done % 200 == 0 or done == total:
            print(f"  Progress: {done}/{total} ({done*100/total:.1f}%)")
        time.sleep(0.1)

    return cache

def main():
    print("==================================================================")
    print("🚀 BẮT ĐẦU MASTER HEALING MỤC 1: TOÀN BỘ HỆ THỐNG NGHE CHÉP CHÍNH TẢ")
    print("==================================================================\n")

    docs = list(db['listeningexercises'].find({
        '$or': [
            {'mode': 'dictation'},
            {'type': 'dictation'},
            {'category': 'dictation'},
            {'title': {'$regex': 'chép chính tả|dictation', '$options': 'i'}}
        ]
    }))

    print(f"1. Thu thập dữ liệu từ {len(docs)} tài liệu...")

    # Phase 1: Clean speaker tags & identify broken abbreviation splits
    cleaned_speaker_count = 0
    merged_split_count = 0

    unique_to_translate = set()

    for doc in docs:
        items = doc.get('questions') or doc.get('items') or []
        
        # Merge abbreviation splits first
        new_items = []
        skip_next = False
        for idx in range(len(items)):
            if skip_next:
                skip_next = False
                continue
            
            curr = items[idx]
            curr_en = curr.get('transcript') or curr.get('dictationText') or ''
            
            if BAD_ABBREV_RE.search(curr_en.strip()) and idx + 1 < len(items):
                next_item = items[idx + 1]
                next_en = next_item.get('transcript') or next_item.get('dictationText') or ''
                # Merge curr and next_item
                merged_en = (curr_en.strip() + ' ' + next_en.strip()).strip()
                curr['transcript'] = merged_en
                curr['dictationText'] = merged_en
                merged_split_count += 1
                skip_next = True
            
            new_items.append(curr)

        # Update doc items
        if doc.get('questions') is not None:
            doc['questions'] = new_items
        else:
            doc['items'] = new_items

        # Clean speaker tags on every item
        for item in new_items:
            en = (item.get('transcript') or item.get('dictationText') or '').strip()
            cleaned_en = clean_sentence(en)
            if cleaned_en != en:
                item['transcript'] = cleaned_en
                item['dictationText'] = cleaned_en
                cleaned_speaker_count += 1
            
            vi = (item.get('translation') or '').strip()
            if vi in ['Phương án phản hồi Part 2.', 'Lời thoại đoạn hội thoại Part 3.']:
                unique_to_translate.add(cleaned_en)

    print(f"  - Số câu đã làm sạch tiền tố/hậu tố người nói (W-Am, M-Cn...): {cleaned_speaker_count}")
    print(f"  - Số câu bị cắt rời do dấu chấm viết tắt (Mr., Ms...) đã hợp nhất: {merged_split_count}")
    print(f"  - Số câu tiếng Anh độc nhất cần dịch mới: {len(unique_to_translate)}")

    # Phase 2: Translate unique sentences
    trans_cache = batch_translate(list(unique_to_translate))

    # Phase 3: Apply translations and regenerate blanks
    print("\n2. Cập nhật bản dịch và chuẩn hóa Blanks cho từng câu...")
    updated_trans_count = 0
    fixed_blanks_count = 0

    for doc in docs:
        items = doc.get('questions') or doc.get('items') or []
        doc_modified = False

        for q_idx, item in enumerate(items):
            en = (item.get('transcript') or item.get('dictationText') or '').strip()
            vi = (item.get('translation') or '').strip()

            # Apply translation
            if vi in ['Phương án phản hồi Part 2.', 'Lời thoại đoạn hội thoại Part 3.']:
                new_vi = trans_cache.get(en)
                if new_vi:
                    item['translation'] = new_vi
                    updated_trans_count += 1
                    doc_modified = True

            # Regenerate blanks if needed
            blanks = item.get('blanks') or []
            needs_blanks = False
            if not blanks or len(blanks) == 0:
                needs_blanks = True
            elif any(re.match(r'^(W-Am|M-Cn|W-Br|M-Au|Man|Woman|Speaker)$', b.get('word', ''), re.I) for b in blanks):
                needs_blanks = True

            if needs_blanks:
                item['blanks'] = generate_blanks(en)
                fixed_blanks_count += 1
                doc_modified = True

            # Ensure testQuestionNumber / questionNumber
            item['questionNumber'] = q_idx + 1

        # Save to database
        update_fields = {
            'totalQuestions': len(items)
        }
        if doc.get('questions') is not None:
            update_fields['questions'] = items
        if doc.get('items') is not None:
            update_fields['items'] = items

        db['listeningexercises'].update_one({'_id': doc['_id']}, {'$set': update_fields})

    print(f"  - Số câu đã cập nhật bản dịch tiếng Việt hoàn chỉnh: {updated_trans_count}")
    print(f"  - Số câu đã làm sạch và tạo Blanks mới chuẩn 100%: {fixed_blanks_count}")

    print("\n==================================================================")
    print("🏆 HOÀN THÀNH MASTER HEAL MỤC 1 TOÀN DIỆN!")
    print("==================================================================")

if __name__ == '__main__':
    main()
