import json
import re
import os
import sys

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

INPUT_FILE = os.path.join(os.path.dirname(__file__), '../src/data/part7_pure_generic_questions.json')

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
    # Split by periods, question marks, exclamation marks, or double spaces/newlines
    raw_sents = re.split(r'(?<=[.?!])\s+|\n+|\s{2,}', text)
    sents = []
    for s in raw_sents:
        s = s.strip()
        if len(s) > 10:
            sents.append(s)
    return sents

def find_evidence(passage, prompt, correct_text, correct_answer):
    clean_p = clean_html(passage)
    sents = split_sentences(clean_p)
    if not sents:
        return clean_p[:150]
    
    # Clean words for matching
    stop_words = {'what', 'when', 'where', 'which', 'who', 'why', 'how', 'does', 'did', 'is', 'are', 'was', 'were', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'about', 'most', 'likely', 'indicated', 'suggested', 'mentioned', 'according'}
    
    prompt_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', prompt.lower())) - stop_words
    ans_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', correct_text.lower())) - stop_words
    
    # Check if NOT question
    is_not = bool(re.search(r'\b(NOT|LEAST)\b', prompt))
    
    best_sent = ""
    best_score = -1
    
    for s in sents:
        s_lower = s.lower()
        s_words = set(re.findall(r'\b[a-zA-Z]{3,}\b', s_lower))
        
        # Scoring
        score = 0
        # Overlap with answer
        ans_overlap = len(ans_words.intersection(s_words))
        score += ans_overlap * 3
        
        # Overlap with prompt
        prompt_overlap = len(prompt_words.intersection(s_words))
        score += prompt_overlap * 2
        
        # Exact substring matches
        if correct_text.lower() in s_lower and len(correct_text) > 3:
            score += 10
            
        if score > best_score:
            best_score = score
            best_sent = s
            
    if best_score > 0 and best_sent:
        return best_sent
    # Fallback to first or second sentence if low score
    return sents[0] if sents else clean_p[:150]

def main():
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        questions = json.load(f)
        
    print(f"Loaded {len(questions)} generic questions.")
    
    for i, q in enumerate(questions[:10]):
        ev = find_evidence(q.get('passageText', ''), q.get('prompt', ''), q.get('correctOptionText', ''), q.get('correctAnswer', ''))
        print(f"\n[{i+1}] {q['test']} Q{q['qNum']}")
        print(f"Prompt: {q['prompt']}")
        print(f"Answer ({q['correctAnswer']}): {q['correctOptionText']}")
        print(f"Matched Evidence: \"{ev}\"")

if __name__ == '__main__':
    main()
