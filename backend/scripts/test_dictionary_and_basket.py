import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:5000/api/v1'

def test_dictionary_lookups():
    print("=== TEST 1: DICTIONARY LOOKUP API ===")
    test_words = [
        'accommodate',
        'schedule',
        'reimburse',
        'prior to',
        'in accordance with',
        'candidate',
        'revenue',
        'feasibility',
        'mandatory',
        'adjacent'
    ]
    
    for word in test_words:
        try:
            res = requests.get(f"{BASE_URL}/dictionary/lookup", params={'word': word}, timeout=8)
            if res.status_code == 200:
                data = res.json().get('data', {})
                trans = data.get('translation', '')
                phonetic = data.get('phonetic', '') or data.get('phoneticUs', '')
                audio = bool(data.get('audioUs') or data.get('audioUk'))
                meanings_count = len(data.get('meanings', []))
                print(f"✅ '{word}': {trans} | IPA: {phonetic} | Audio: {audio} | Meanings: {meanings_count}")
            else:
                print(f"❌ '{word}' failed with status {res.status_code}: {res.text}")
        except Exception as e:
            print(f"❌ Error testing '{word}': {e}")

def test_basket_endpoints():
    print("\n=== TEST 2: VOCABULARY BASKET APIS ===")
    # 1. Add to basket as guest / public
    test_word_entry = {
        'word': 'feasibility',
        'phonetic': '/ˌfiː.zəˈbɪl.ə.ti/',
        'meaning': 'tính khả thi',
        'exampleEn': 'We are studying the feasibility of the project.',
        'exampleVi': 'Chúng tôi đang nghiên cứu tính khả thi của dự án.',
        'pos': 'noun',
        'deckName': 'Test Practice Deck',
        'source': 'test'
    }
    
    res = requests.post(f"{BASE_URL}/vocab/basket", json=test_word_entry, timeout=5)
    print(f"Add word to basket status: {res.status_code}, response: {res.json().get('message', res.text)}")
    
    # 2. Get basket words
    res = requests.get(f"{BASE_URL}/vocab/basket", timeout=5)
    print(f"Get basket words status: {res.status_code}, count: {res.json().get('count')}")
    
    # 3. Get user decks
    res = requests.get(f"{BASE_URL}/vocab/decks", timeout=5)
    print(f"Get decks status: {res.status_code}, count: {res.json().get('count')}")
    
    # 4. Remove word from basket
    res = requests.delete(f"{BASE_URL}/vocab/basket/feasibility", timeout=5)
    print(f"Delete word status: {res.status_code}, response: {res.json().get('message')}")

if __name__ == '__main__':
    test_dictionary_lookups()
    test_basket_endpoints()
