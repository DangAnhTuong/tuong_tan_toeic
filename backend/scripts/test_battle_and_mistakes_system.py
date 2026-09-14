import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://127.0.0.1:5000/api/v1'

print("=" * 70)
print("🧪 KIỂM THỬ TÍCH HỢP TOÀN DIỆN MỤC 5: 1V1 BATTLE & ERROR NOTEBOOK")
print("=" * 70)

# 1. Test GET /battle/arena-info
print("\n1. 🏟️ KIỂM THỬ GET /api/v1/battle/arena-info:")
res = requests.get(f'{BASE_URL}/battle/arena-info')
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
arena_data = res.json().get('data', {})
print(f"   ✅ [PASS] Mã 200 OK. Người chơi: {arena_data.get('userName')} | Rank: {arena_data.get('battleTier')} | Elo: {arena_data.get('battleElo')} | Online: {arena_data.get('onlineCount')}")

# 2. Test POST /battle/matchmake
print("\n2. ⚔️ KIỂM THỬ POST /api/v1/battle/matchmake (CÂU HỎI PART 5 ĐỘNG):")
res = requests.post(f'{BASE_URL}/battle/matchmake', json={'topic': 'part5'})
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
match_data = res.json().get('data', {})
questions = match_data.get('questions', [])
print(f"   ✅ [PASS] Tạo trận đấu thành công. RoomId: {match_data.get('roomId')}")
print(f"   ✅ [PASS] Đối thủ được ghép: {match_data.get('opponent', {}).get('name')} (Rank {match_data.get('opponent', {}).get('tier')}, Elo {match_data.get('opponent', {}).get('elo')})")
print(f"   ✅ [PASS] Số câu hỏi sinh ra: {len(questions)} / 10 câu")
assert len(questions) == 10, "Phải có đúng 10 câu hỏi"

# Kiểm tra tính toàn vẹn của câu hỏi sinh ra
for i, q in enumerate(questions[:3]):
    print(f"      Q{i+1}: {q.get('promptText')[:70]}...")
    print(f"         Options ({len(q.get('options'))}): {q.get('options')}")
    print(f"         Đáp án: {q.get('correctAnswer')} | Giải thích: {bool(q.get('explanation'))}")
    assert len(q.get('options')) == 4, "Mỗi câu hỏi Part 5 phải có 4 lựa chọn"
    assert q.get('correctAnswer') in ['A', 'B', 'C', 'D'], f"Đáp án không hợp lệ: {q.get('correctAnswer')}"

# 3. Test POST /battle/finish
print("\n3. 🏆 KIỂM THỬ POST /api/v1/battle/finish (KẾT THÚC TRẬN ĐẤU & CỘNG ĐIỂM):")
res = requests.post(f'{BASE_URL}/battle/finish', json={
    'isWinner': True,
    'userScore': 850,
    'correctCount': 8
})
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
finish_res = res.json()
print(f"   ✅ [PASS] {finish_res.get('message')}")
print(f"   ✅ [PASS] Điểm thưởng XP: +{finish_res.get('data', {}).get('xpReward')} XP | Elo mới: {finish_res.get('data', {}).get('newElo')}")

# 4. Test POST /mistakes (Lưu câu sai từ Battle)
print("\n4. 📖 KIỂM THỬ POST /api/v1/mistakes (GHI NHẬN CÂU SAI TỪ 1V1 BATTLE):")
battle_q = questions[0]
res = requests.post(f'{BASE_URL}/mistakes', json={
    'questionId': f"battle-test-{battle_q.get('id')}",
    'part': 'Part 5', # Test resilient string parsing
    'section': 'READING',
    'prompt': battle_q.get('promptText'),
    'passageText': battle_q.get('promptText'),
    'options': [{'label': f"({['A','B','C','D'][idx]})", 'text': opt} for idx, opt in enumerate(battle_q.get('options'))],
    'correctAnswer': ['A', 'B', 'C', 'D'].index(battle_q.get('correctAnswer')),
    'userAnswer': 3,
    'explanation': battle_q.get('explanation'),
    'categoryTag': '1v1 Battle Part 5'
})
assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
saved_battle_mistake = res.json().get('data', {})
print(f"   ✅ [PASS] Đã lưu câu sai Part 5 thành công! Id: {saved_battle_mistake.get('_id')} | Part đã chuẩn hóa: {saved_battle_mistake.get('part')} (Number)")

# 5. Test POST /mistakes (Lưu câu sai từ Listening)
print("\n5. 🎧 KIỂM THỬ POST /api/v1/mistakes (GHI NHẬN CÂU SAI TỪ LISTENING KÈM AUDIO):")
res = requests.post(f'{BASE_URL}/mistakes', json={
    'questionId': "listen-test-sample-q1",
    'part': 2,
    'section': 'LISTENING',
    'prompt': "Where did you leave the conference room key?",
    'passageText': "Where did you leave the conference room key?",
    'audioUrl': "https://res.cloudinary.com/dtsf91mco/video/upload/v1714578912/sample_part2.mp3",
    'options': [
        {'label': '(A)', 'text': 'At 3:00 PM.'},
        {'label': '(B)', 'text': 'On the receptionist desk.'},
        {'label': '(C)', 'text': 'Yes, I enjoyed it.'}
    ],
    'correctAnswer': 1,
    'userAnswer': 0,
    'explanation': 'Câu hỏi WH- question về vị trí (Where) cần câu trả lời địa điểm.',
    'categoryTag': 'Part 2 Listening'
})
assert res.status_code == 200, f"Expected 200, got {res.status_code}: {res.text}"
saved_listen_mistake = res.json().get('data', {})
print(f"   ✅ [PASS] Đã lưu câu sai Listening có Audio! Id: {saved_listen_mistake.get('_id')} | Audio: {saved_listen_mistake.get('audioUrl')}")

# 6. Test GET /mistakes & GET /mistakes/stats
print("\n6. 📊 KIỂM THỬ GET /api/v1/mistakes & /api/v1/mistakes/stats:")
res = requests.get(f'{BASE_URL}/mistakes')
assert res.status_code == 200, f"Expected 200, got {res.status_code}"
mistakes_list = res.json().get('data', [])
print(f"   ✅ [PASS] Lấy danh sách câu sai thành công: {len(mistakes_list)} câu trong sổ tay")

res_stats = requests.get(f'{BASE_URL}/mistakes/stats')
assert res_stats.status_code == 200, f"Expected 200, got {res_stats.status_code}"
stats_data = res_stats.json().get('data', {})
print(f"   ✅ [PASS] Thống kê: Tổng {stats_data.get('totalMistakes')} câu | Cần ôn: {stats_data.get('pendingCount')} | Đã thuộc: {stats_data.get('masteredCount')}")

# 7. Test PUT /mistakes/:id/master (Đánh dấu đã thuộc & đưa về cần ôn)
print("\n7. 🔄 KIỂM THỬ PUT /api/v1/mistakes/:id/master (CHUYỂN ĐỔI TRẠNG THÁI THUỘC):")
test_id = saved_battle_mistake.get('_id')
res_master = requests.put(f'{BASE_URL}/mistakes/{test_id}/master', json={'isMastered': True})
assert res_master.status_code == 200, f"Expected 200, got {res_master.status_code}"
print(f"   ✅ [PASS] Đánh dấu đã thuộc: {res_master.json().get('message')}")

res_unmaster = requests.put(f'{BASE_URL}/mistakes/{test_id}/master', json={'isMastered': False})
assert res_unmaster.status_code == 200, f"Expected 200, got {res_unmaster.status_code}"
print(f"   ✅ [PASS] Đưa về cần ôn tập: {res_unmaster.json().get('message')}")

# 8. Test DELETE /mistakes/:id (Xóa câu sai thử nghiệm)
print("\n8. 🗑️ KIỂM THỬ DELETE /api/v1/mistakes/:id (XÓA BẢN GHI CÂU SAI):")
res_del1 = requests.delete(f'{BASE_URL}/mistakes/{saved_battle_mistake.get("_id")}')
res_del2 = requests.delete(f'{BASE_URL}/mistakes/{saved_listen_mistake.get("_id")}')
assert res_del1.status_code == 200, f"Expected 200, got {res_del1.status_code}"
assert res_del2.status_code == 200, f"Expected 200, got {res_del2.status_code}"
print(f"   ✅ [PASS] Xóa bản ghi câu sai mẫu thành công!")

print("\n" + "=" * 70)
print("🎉 TẤT CẢ 8 HẠNG MỤC KIỂM THỬ BATTLE ARENA & ERROR NOTEBOOK ĐỀU PASSED 100%!")
print("=" * 70)
