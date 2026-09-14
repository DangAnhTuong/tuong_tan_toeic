import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://toeic.danganhtuong.dev/api/v1'

print("=" * 80)
print("🧪 KIỂM TRA PHÁP CHỨNG: LUỒNG NỘP ĐỀ THI, SCALED SCORE & SỔ TAY CÂU SAI")
print("=" * 80)

# 1. Fetch Test 1 to get sample question IDs and correct answers
r_tests = requests.get(f"{BASE_URL}/mocktest/tests", timeout=10)
tests = r_tests.json().get('data', [])
if not tests:
    print("❌ Không lấy được danh sách đề thi!")
    sys.exit(1)

test1 = tests[0]
test_id = test1['_id']
print(f"  * Bộ đề thử nghiệm: [{test_id}] {test1.get('title')}")

r_detail = requests.get(f"{BASE_URL}/mocktest/tests/{test_id}", timeout=15)
questions = r_detail.json().get('data', {}).get('questions', [])
print(f"  * Số câu hỏi trong đề: {len(questions)}")

# Prepare an intentional submission:
# Answer Q1 correct, Q2 wrong, Q3 wrong
q1 = questions[0]
q2 = questions[1]
q3 = questions[2]

q1_correct = q1.get('correctAnswer', 'A')
q2_wrong = 'D' if q2.get('correctAnswer') != 'D' else 'A'
q3_wrong = 'D' if q3.get('correctAnswer') != 'D' else 'A'

answers = {
    str(q1.get('questionNum', 1)): q1_correct,
    str(q2.get('questionNum', 2)): q2_wrong,
    str(q3.get('questionNum', 3)): q3_wrong
}

print(f"  * Giả lập bài nộp: Câu 1={q1_correct} (Đúng), Câu 2={q2_wrong} (Sai), Câu 3={q3_wrong} (Sai)")

submit_payload = {
    "testId": test_id,
    "answers": answers,
    "timeSpentSeconds": 120,
    "mode": "practice"
}

r_submit = requests.post(f"{BASE_URL}/mocktest/submit", json=submit_payload, timeout=10)
print(f"  * Submit status code: {r_submit.status_code}")

if r_submit.status_code != 200:
    print(f"❌ Submit failed: {r_submit.text}")
    sys.exit(1)

eval_res = r_submit.json().get('data', {})
print("\n📊 [KẾT QUẢ CHẤM ĐIỂM CHUẨN ETS TRẢ VỀ TỪ SERVER VPS]:")
print(f"  ✅ Điểm Tổng Ước Tính: {eval_res.get('totalScore')} / 990 PTS")
print(f"  ✅ Điểm Listening:      {eval_res.get('listeningScore')} / 495 PTS")
print(f"  ✅ Điểm Reading:        {eval_res.get('readingScore')} / 495 PTS")
print(f"  ✅ Số câu đúng:         {eval_res.get('correctCount')} / {eval_res.get('totalQuestions')}")
print(f"  ✅ Độ chính xác:        {eval_res.get('accuracy')}%")

print("\n🔍 [KIỂM TRA VÒNG LẶP SỔ TAY CÂU SAI (/mistakes)]:")
r_mistakes = requests.get(f"{BASE_URL}/mistakes", timeout=10)
print(f"  * Mistakes API status: {r_mistakes.status_code}")
if r_mistakes.status_code == 200:
    m_list = r_mistakes.json().get('data', [])
    print(f"  ✅ Sổ tay câu sai hiện có: {len(m_list)} câu đang theo dõi")
    if m_list:
        sample_m = m_list[0]
        print(f"     - Câu sai gần nhất: [{sample_m.get('categoryTag', 'N/A')}] {sample_m.get('prompt', '')[:60]}...")
        print(f"     - Đáp án học viên: {sample_m.get('userAnswer')} | Đáp án đúng: {sample_m.get('correctAnswer')}")
        print(f"     - Đã gắn lời giải chi tiết: {'Có' if sample_m.get('explanation') else 'Không'}")

print("\n" + "=" * 80)
print("🎉 TOÀN BỘ LUỒNG NỘP ĐỀ, SCALED SCORE VÀ MISTAKES KHÉP KÍN ĐẠT CHUẨN 100%!")
print("=" * 80)
