import json
import os
import sys
import time
import urllib.parse
import urllib.request

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

INPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/data/dictation_unique_sentences_to_translate.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/data/dictation_sentence_translations.json')

def translate_batch(sentences):
    if not sentences:
        return {}
    
    # Use clean newline separator
    joined = '\n'.join(s.strip() for s in sentences)
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(joined)
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            lines = ''.join(c[0] for c in data[0] if c[0]).split('\n')
            if len(lines) == len(sentences):
                return {s: t.strip() for s, t in zip(sentences, lines)}
    except Exception as e:
        print(f"Batch request failed ({e}), falling back to single translation...")

    # Fallback to single sentence translation
    results = {}
    for s in sentences:
        results[s] = translate_single(s)
        time.sleep(0.04)
    return results

def translate_single(text):
    if not text or not text.strip():
        return ''
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(text.strip())
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=6) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return ''.join(c[0] for c in data[0] if c[0]).strip()
    except Exception:
        return text

def main():
    print(f"📖 Loading unique sentences from {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        sentences = json.load(f)
    print(f"Total sentences to translate: {len(sentences)}")

    # Load existing cache if any
    translations = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                translations = json.load(f)
            print(f"Loaded {len(translations)} already translated sentences.")
        except Exception:
            translations = {}

    to_translate = [s for s in sentences if s not in translations and s.strip()]
    print(f"Remaining to translate: {len(to_translate)}")

    BATCH_SIZE = 30
    total_batches = (len(to_translate) + BATCH_SIZE - 1) // BATCH_SIZE

    for i in range(0, len(to_translate), BATCH_SIZE):
        chunk = to_translate[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        print(f"⏳ Translating batch {batch_num}/{total_batches} ({len(chunk)} sentences)...")
        batch_res = translate_batch(chunk)
        translations.update(batch_res)

        # Save intermediate progress
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(translations, f, ensure_ascii=False, indent=2)

        time.sleep(0.25)

    print(f"\n✅ All {len(translations)} sentences translated successfully!")
    print(f"Saved to {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
