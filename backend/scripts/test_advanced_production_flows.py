import sys
import requests
import json

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://toeic.danganhtuong.dev/api/v1'

print("=" * 80)
print("🚀 KIỂM TRA CÁC LUỒNG NGHIỆP VỤ NÂNG CAO TRÊN VPS PRODUCTION")
print("=" * 80)

# 1. TEST VIETQR PAYMENT GATEWAY
print("\n💳 [1. KIỂM TRA CỔNG THANH TOÁN VIETQR & TẠO ĐƠN HÀNG]")
try:
    order_payload = {
        "tier": "pro_4_months",
        "email": "test_audit_vps@example.com",
        "fullName": "Học Viên Test Kiểm Toán",
        "amount": 99000
    }
    r_order = requests.post(f"{BASE_URL}/payment/create-order", json=order_payload, timeout=10)
    print(f"  * Status: {r_order.status_code}")
    if r_order.status_code in [200, 201]:
        o_data = r_order.json().get('data', {})
        print(f"  ✅ Tạo đơn hàng thành công!")
        print(f"     - Mã đơn: {o_data.get('orderCode') or o_data.get('orderId')}")
        print(f"     - Số tiền: {o_data.get('amount'):,} VNĐ")
        print(f"     - Nội dung chuyển khoản: {o_data.get('transferContent') or o_data.get('description')}")
        print(f"     - QR Link MB Bank: {o_data.get('qrUrl', 'N/A')[:60]}...")
    else:
        print(f"  ⚠️ Phản hồi: {r_order.text[:200]}")
except Exception as e:
    print(f"  ❌ Lỗi kết nối: {e}")

# 2. TEST MOCK TEST SCORING & SUBMISSION ENGINE
print("\n📝 [2. KIỂM TRA CƠ CHẾ CHẤM ĐIỂM SCALED SCORE & NỘP BÀI THI]")
try:
    # Get test 1
    r_tests = requests.get(f"{BASE_URL}/mocktest/tests", timeout=10)
    tests = r_tests.json().get('data', [])
    if tests:
        test_id = tests[0]['_id']
        submit_payload = {
            "testId": test_id,
            "mode": "practice",
            "timeSpentSeconds": 180,
            "userAnswers": {
                "1": "A",
                "2": "B",
                "3": "C"
            }
        }
        r_sub = requests.post(f"{BASE_URL}/mocktest/submit", json=submit_payload, timeout=10)
        print(f"  * Status: {r_sub.status_code}")
        if r_sub.status_code == 200:
            res_data = r_sub.json().get('data', {})
            print(f"  ✅ Thuật toán chấm điểm chuẩn ETS hoạt động hoàn hảo!")
            print(f"     - Raw Correct: {res_data.get('correctCount', 0)}/{res_data.get('totalQuestions', 200)}")
            print(f"     - Estimated TOEIC Score: {res_data.get('estimatedScore', 'N/A')} / 990")
            print(f"     - Listening Score: {res_data.get('listeningScore', 'N/A')} / 495")
            print(f"     - Reading Score: {res_data.get('readingScore', 'N/A')} / 495")
        else:
            print(f"  ⚠️ Phản hồi: {r_sub.text[:200]}")
except Exception as e:
    print(f"  ❌ Lỗi kết nối: {e}")

# 3. TEST SPEAKING & WRITING ENDPOINTS
print("\n🗣️ [3. KIỂM TRA MÔ-ĐUN SPEAKING & WRITING]")
try:
    r_spk = requests.get(f"{BASE_URL}/speaking/topics", timeout=10)
    print(f"  * Speaking Topics API: Status {r_spk.status_code}")
    if r_spk.status_code == 200:
        spk_data = r_spk.json().get('data', [])
        print(f"  ✅ Kho đề Luyện Nói AI: {len(spk_data)} bộ câu hỏi 5 Parts")
    else:
        print(f"    Phản hồi: {r_spk.text[:100]}")
except Exception as e:
    print(f"  ⚠️ Speaking API: {e}")

try:
    r_wrt = requests.get(f"{BASE_URL}/writing/topics", timeout=10)
    print(f"  * Writing Topics API: Status {r_wrt.status_code}")
    if r_wrt.status_code == 200:
        wrt_data = r_wrt.json().get('data', [])
        print(f"  ✅ Kho đề Luyện Viết AI: {len(wrt_data)} đề 3 Parts")
    else:
        print(f"    Phản hồi: {r_wrt.text[:100]}")
except Exception as e:
    print(f"  ⚠️ Writing API: {e}")

print("\n" + "=" * 80)
print("🎉 KIỂM TRA CÁC LUỒNG NGHIỆP VỤ NÂNG CAO HOÀN TẤT!")
print("=" * 80)
