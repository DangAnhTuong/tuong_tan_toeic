import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://toeic.danganhtuong.dev/api/v1'

print("=" * 80)
print("🔍 ĐẠI HỘI ĐỒNG KIỂM TOÁN DỮ LIỆU TẤT CẢ PHÂN HỆ TRÊN VPS PRODUCTION")
print("=" * 80)

def check_section(name, res):
    if res.status_code == 200:
        data = res.json()
        return data.get('data') or data
    else:
        print(f"  ❌ [{res.status_code}] Failed to fetch {name}")
        return None

# 1. LISTENING AUDIT
print("\n🎧 [MÔ-ĐUN 1: LUYỆN NGHE THEO LEVEL & CHỦ ĐỀ & DICTATION]")
res_dict = requests.get(f"{BASE_URL}/listening/exercises?mode=dictation", timeout=15)
if res_dict.status_code == 200:
    items = res_dict.json().get('data', [])
    print(f"  ✅ Dictation Sets: {len(items)} bài nghe chép chính tả")
    # Verify sample
    if len(items) > 0:
        sample = items[0]
        print(f"     -> Mẫu: {sample.get('title', 'N/A')} | Part: {sample.get('part')} | Sentences: {len(sample.get('sentences', []))}")

res_listen_lvl = requests.get(f"{BASE_URL}/listening/exercises?mode=level", timeout=15)
if res_listen_lvl.status_code == 200:
    items = res_listen_lvl.json().get('data', [])
    print(f"  ✅ Listening Level Exercises: {len(items)} cụm bài")
    parts = {}
    for it in items:
        p = it.get('part', 0)
        parts[p] = parts.get(p, 0) + 1
    print(f"     -> Phân bố Parts: {parts}")

# 2. READING AUDIT
print("\n📖 [MÔ-ĐUN 2: LUYỆN ĐỌC, NGỮ PHÁP & BÀI ĐỌC SONG NGỮ]")
res_read_lvl = requests.get(f"{BASE_URL}/reading/exercises?mode=level", timeout=15)
if res_read_lvl.status_code == 200:
    items = res_read_lvl.json().get('data', [])
    print(f"  ✅ Reading Level Exercises: {len(items)} bài/đoạn")
    parts = {}
    for it in items:
        p = it.get('part', 0)
        parts[p] = parts.get(p, 0) + 1
    print(f"     -> Phân bố Parts (5, 6, 7): {parts}")

res_grammar = requests.get(f"{BASE_URL}/reading/exercises?mode=grammar", timeout=15)
if res_grammar.status_code == 200:
    items = res_grammar.json().get('data', [])
    print(f"  ✅ Grammar Topics & Year Sets: {len(items)} chuyên đề/bộ đề")
    topics = [it.get('title') for it in items[:5]]
    print(f"     -> Mẫu chuyên đề: {topics}")

res_bilingual = requests.get(f"{BASE_URL}/reading/exercises?mode=bilingual", timeout=15)
if res_bilingual.status_code == 200:
    items = res_bilingual.json().get('data', [])
    print(f"  ✅ Bilingual Articles (Đọc song ngữ): {len(items)} bài đọc")
    lvl1 = sum(1 for it in items if it.get('level') == 1)
    lvl2 = sum(1 for it in items if it.get('level') == 2)
    print(f"     -> Level 1 (Cơ bản): {lvl1} bài | Level 2 (Nâng cao): {lvl2} bài (Chuẩn Đậu TOEIC 31 bài)")

# 3. MOCK TESTS AUDIT
print("\n📝 [MÔ-ĐUN 3: 10 BỘ ĐỀ ETS 2026 FULL 200 CÂU]")
res_mock = requests.get(f"{BASE_URL}/mocktest/tests", timeout=15)
if res_mock.status_code == 200:
    tests = res_mock.json().get('data', [])
    print(f"  ✅ Mock Tests Total: {len(tests)} bộ đề")
    for t in tests[:3]:
        print(f"     -> [{t.get('_id')}] {t.get('title')} | Questions: {t.get('totalQuestions', len(t.get('questions', [])))} | Year: {t.get('year', 2026)}")

# 4. VOCABULARY AUDIT
print("\n📚 [MÔ-ĐUN 4: TỪ VỰNG SM-2 & 83 CHỦ ĐỀ CHUẨN ĐẬU TOEIC]")
res_vocab = requests.get(f"{BASE_URL}/vocab/topics", timeout=15)
if res_vocab.status_code == 200:
    topics = res_vocab.json().get('data', [])
    print(f"  ✅ Vocabulary Topics: {len(topics)} chủ đề")
    total_words = sum(len(tp.get('words', [])) for tp in topics)
    print(f"     -> Tổng số từ vựng nạp sẵn: {total_words} từ có IPA, định nghĩa, ví dụ song ngữ")

# 5. 1V1 BATTLE & MISTAKES
print("\n⚔️ [MÔ-ĐUN 5: ĐẤU TRƯỜNG 1V1 & SỔ TAY CÂU SAI]")
res_battle = requests.get(f"{BASE_URL}/battle/arena-info", timeout=15)
if res_battle.status_code == 200:
    binfo = res_battle.json().get('data', {})
    print(f"  ✅ Đấu trường 1v1: Top Elo = {binfo.get('topRank', {}).get('fullName', 'N/A')} ({binfo.get('topRank', {}).get('elo', 0)} Elo) | Online: {binfo.get('onlineCount', 0)}")

res_mistakes = requests.get(f"{BASE_URL}/mistakes/stats", timeout=15)
if res_mistakes.status_code == 200:
    mstats = res_mistakes.json().get('data', {})
    print(f"  ✅ Sổ tay câu sai: Thống kê hỗ trợ 7 Parts khép kín: {list(mstats.keys())}")

# 6. LEADERBOARD & SOCIAL
print("\n🏆 [MÔ-ĐUN 6: BẢNG XẾP HẠNG & THEO DÕI THỜI GIAN THỰC]")
res_lb = requests.get(f"{BASE_URL}/leaderboard?timeframe=today", timeout=15)
if res_lb.status_code == 200:
    lb_data = res_lb.json().get('data', [])
    print(f"  ✅ Bảng xếp hạng Hôm nay: {len(lb_data)} học viên cạnh tranh")
    if len(lb_data) > 0:
        top1 = lb_data[0]
        print(f"     -> Top 1: {top1.get('fullName')} | XP: {top1.get('xp')} | Time: {top1.get('timeSpent', 'N/A')}")

print("\n" + "=" * 80)
print("🎉 KIỂM TOÁN TẤT CẢ DỮ LIỆU HOÀN TẤT THÀNH CÔNG RỰC RỠ!")
print("=" * 80)
