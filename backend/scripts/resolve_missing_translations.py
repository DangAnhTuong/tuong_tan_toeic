import json
import os
import sys
import time
import urllib.parse
import urllib.request

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

MISSING_FILE = os.path.join(os.path.dirname(__file__), '../src/data/targets_still_missing.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/data/newly_resolved_translations.json')
CACHE_FILE = os.path.join(os.path.dirname(__file__), '../src/data/persistent_translation_cache.json')

def translate_batch(words):
    if not words:
        return {}
    
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote('\n'.join(words))
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            lines = ''.join(c[0] for c in data[0] if c[0]).split('\n')
            if len(lines) == len(words):
                return {w: t.strip() for w, t in zip(words, lines)}
    except Exception as e:
        print(f"Batch request failed: {e}")
    
    # Fallback to single word translation
    results = {}
    for w in words:
        results[w] = translate_single(w)
        time.sleep(0.05)
    return results

def translate_single(word):
    if not word or not word.strip():
        return ''
    url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(word.strip())
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return ''.join(c[0] for c in data[0] if c[0]).strip()
    except Exception:
        return word

def main():
    print(f"Loading missing targets from {MISSING_FILE}...")
    with open(MISSING_FILE, 'r', encoding='utf-8') as f:
        targets = json.load(f)
    
    print(f"Total targets to resolve: {len(targets)}")
    
    # Load existing newly resolved cache if any
    resolved = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
                resolved = json.load(f)
            print(f"Loaded {len(resolved)} already resolved terms.")
        except Exception:
            resolved = {}

    to_process = [t for t in targets if t not in resolved and t.strip()]
    print(f"Remaining to translate: {len(to_process)}")

    BATCH_SIZE = 40
    for i in range(0, len(to_process), BATCH_SIZE):
        chunk = to_process[i:i + BATCH_SIZE]
        print(f"Processing batch {i//BATCH_SIZE + 1}/{(len(to_process) + BATCH_SIZE - 1)//BATCH_SIZE} ({len(chunk)} words)...")
        batch_results = translate_batch(chunk)
        resolved.update(batch_results)
        
        # Save intermediate
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(resolved, f, ensure_ascii=False, indent=2)
        
        time.sleep(0.3)

    print(f"✅ Finished! Total resolved: {len(resolved)}")
    
    # Merge into persistent_translation_cache.json
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        before = len(cache)
        cache.update(resolved)
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False, indent=2)
        print(f"✅ Updated persistent_translation_cache.json: {before} -> {len(cache)} entries.")

if __name__ == '__main__':
    main()
