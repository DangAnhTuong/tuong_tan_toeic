import json
import re
import os
import sys
import time
import urllib.parse
import urllib.request

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

INPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/data/part7_only_to_heal.json')
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/data/part7_healed_explanations.json')

def clean_html(raw_html):
    if not raw_html:
        return ""
    clean = re.sub(r'<[^>]+>', ' ', raw_html)
    clean = re.sub(r'&amp;', '&', clean)
    clean = re.sub(r'&nbsp;', ' ', clean)
    clean = re.sub(r'&mdash;', '—', clean)
    clean = re.sub(r'&ndash;', '–', clean)
    clean = re.sub(r'\s+', ' ', clean)
    return clean.strip()

def split_sentences(text):
    raw_sents = re.split(r'(?<=[.?!])\s+|\n+|\s{2,}', text)
    sents = []
    for s in raw_sents:
        s = s.strip()
        if len(s) > 12:
            sents.append(s)
    return sents

def translate_text(text):
    if not text or not text.strip():
        return ''
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=' + urllib.parse.quote(text.strip())
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return ''.join(c[0] for c in data[0] if c[0]).strip()
    except Exception:
        return text

def extract_best_evidence(passage, prompt, correct_text, correct_answer, options):
    clean_p = clean_html(passage)
    sents = split_sentences(clean_p)
    if not sents:
        return clean_p[:180], clean_p[:80]
    
    stop_words = {
        'what', 'when', 'where', 'which', 'who', 'why', 'how', 'does', 'did', 'is', 'are', 
        'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about', 
        'most', 'likely', 'indicated', 'suggested', 'mentioned', 'according', 'refer', 'following',
        'questions', 'paragraph', 'line', 'closest', 'meaning', 'stated', 'implied', 'true'
    }
    
    prompt_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', prompt.lower())) - stop_words
    ans_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', correct_text.lower())) - stop_words
    
    is_not = bool(re.search(r'\b(NOT|LEAST)\b', prompt))
    
    # Vocabulary in context: "The word 'XYZ' in paragraph A, line B, is closest in meaning to"
    vocab_match = re.search(r'word\s*["“\']([^"\'”]+)["\'”]', prompt, re.I)
    if vocab_match:
        target_word = vocab_match.group(1).lower()
        for s in sents:
            if re.search(r'\b' + re.escape(target_word) + r'\b', s, re.I):
                return s, f"Từ \"{target_word}\" trong ngữ cảnh"

    # Number / price match
    num_match = re.search(r'(\$\d+(?:\.\d{2})?|\b\d{1,4}\b)', correct_text)
    if num_match:
        val = num_match.group(1)
        for s in sents:
            if val.lower() in s.lower():
                return s, val

    best_sent = ""
    best_score = -1
    
    for s in sents:
        s_lower = s.lower()
        s_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', s_lower))
        
        score = 0
        ans_overlap = len(ans_words.intersection(s_words))
        score += ans_overlap * 4
        
        prompt_overlap = len(prompt_words.intersection(s_words))
        score += prompt_overlap * 2
        
        if correct_text.lower() in s_lower and len(correct_text) > 3:
            score += 15
            
        if score > best_score:
            best_score = score
            best_sent = s
            
    if best_score > 0 and best_sent:
        # Key phrase in evidence
        overlap_words = list(ans_words.intersection(set(re.findall(r'\b[a-zA-Z]{3,}\b', best_sent.lower()))))
        key_phrase = ' '.join(overlap_words[:3]) if overlap_words else best_sent[:40]
        return best_sent, key_phrase
    
    # Fallback to first sentence
    fallback = sents[0] if sents else clean_p[:180]
    return fallback, fallback[:40]

def main():
    print(f"📖 Reading questions from {INPUT_FILE}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    print(f"Total Part 7 questions to process: {len(questions)}")
    
    healed = []
    
    for i, q in enumerate(questions):
        q_num = q.get('qNum')
        prompt = q.get('prompt', '')
        correct_ans = q.get('correctAnswer', 'A')
        correct_text = q.get('correctOptionText', '')
        passage = q.get('passageText', '')
        options = q.get('options', [])
        
        correct_opt = next((o for o in options if correct_ans in o.get('label', '')), None)
        correct_vi = correct_opt.get('translation', '') if correct_opt else ''
        if not correct_vi or correct_vi == correct_text:
            correct_vi = translate_text(correct_text)
            
        evidence_en, key_phrase = extract_best_evidence(passage, prompt, correct_text, correct_ans, options)
        evidence_vi = translate_text(evidence_en)
        time.sleep(0.04) # rate limiting polite delay
        
        # Build explanation
        full_explanation = f"""🎯 ĐÁP ÁN ĐÚNG: ({correct_ans}) "{correct_text}" ({correct_vi})

💡 DẪN CHỨNG BÀI ĐỌC:
• Dẫn chứng: "{evidence_en}"
({evidence_vi})

🔄 PARAPHRASE & SUY LUẬN:
• "{key_phrase if key_phrase else evidence_en[:35]}" ➔ "{correct_text}"
(Thông tin trong bài đọc trực tiếp xác nhận và đối ứng chính xác với phương án ({correct_ans}).)

🔍 PHÂN TÍCH BẪY ETS:
• Phương án ({correct_ans}) là đáp án đúng theo ngữ cảnh văn bản. Các phương án còn lại là bẫy thông tin sai lệch, không được đề cập hoặc mâu thuẫn với bài đọc."""

        healed.append({
            "docId": q.get('docId'),
            "collection": q.get('collection'),
            "title": q.get('title'),
            "qNum": q_num,
            "prompt": prompt,
            "correctAnswer": correct_ans,
            "correctOptionText": correct_text,
            "explanation": full_explanation
        })
        
        if (i + 1) % 25 == 0 or (i + 1) == len(questions):
            print(f"Progress: {i + 1}/{len(questions)} ({(i + 1)/len(questions)*100:.1f}%) questions processed...")
            
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(healed, f, ensure_ascii=False, indent=2)
        
    print(f"🎉 Completed! Saved {len(healed)} healed explanations to {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
