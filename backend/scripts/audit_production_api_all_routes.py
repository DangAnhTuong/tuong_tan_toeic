import sys
import time
import requests
import json

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'https://toeic.danganhtuong.dev/api/v1'

print("=" * 75)
print("🌐 ĐẠI KIỂM TOÁN TẤT CẢ CÁC TUYẾN ĐƯỜNG API TRÊN VPS PRODUCTION")
print("=" * 75)

endpoints = [
    # 1. Health & Core
    ('GET', '/../../health', 'Gateway Health Check'),
    ('GET', '/user/profile', 'User Profile (Guest)'),
    ('GET', '/audio/tts?text=hello&lang=en-US', 'Audio Edge TTS Service'),
    
    # 2. Vocabulary & SM-2
    ('GET', '/vocab/topics', '83 Chủ đề Từ vựng Đậu TOEIC'),
    ('GET', '/vocab/due-count', 'Số từ đến hạn ôn tập SM-2'),
    ('GET', '/vocab/basket', 'Giỏ từ vựng thông minh'),
    ('GET', '/vocab/decks', 'Danh sách Học phần cá nhân'),
    ('GET', '/dictionary/lookup?word=accommodate', 'Bộ tra từ điển tức thì Multi-tier'),
    
    # 3. Listening
    ('GET', '/listening/exercises?mode=dictation', 'Nghe Chép Chính Tả (Dictation)'),
    ('GET', '/listening/exercises?mode=level', 'Luyện Nghe theo Level Part 1-4'),
    ('GET', '/listening/exercises?mode=topic', 'Luyện Nghe theo Chủ đề hội thoại'),
    
    # 4. Reading & Grammar
    ('GET', '/reading/exercises?mode=level', 'Luyện Đọc theo Level Part 5-7'),
    ('GET', '/reading/exercises?mode=grammar', '14 Chuyên đề Ngữ pháp'),
    ('GET', '/reading/exercises?mode=bilingual', 'Bài đọc Song ngữ 2 Levels'),
    
    # 5. Mock Tests
    ('GET', '/mocktest/tests', '10 Bộ đề ETS 2026 Full 200 câu'),
    
    # 6. Battle & Mistakes
    ('GET', '/battle/arena-info', 'Đấu trường 1v1 Arena Stats'),
    ('POST', '/battle/matchmake', 'Ghép trận 1v1 trích xuất 10 câu Part 5 thật', {'topic': 'part5'}),
    ('GET', '/mistakes', 'Danh sách câu sai Sổ tay'),
    ('GET', '/mistakes/stats', 'Thống kê câu sai theo Part'),
    
    # 7. Leaderboard, Notifications, Blog, Video
    ('GET', '/leaderboard?timeframe=today', 'Bảng xếp hạng Hôm nay'),
    ('GET', '/leaderboard?timeframe=all', 'Bảng xếp hạng Mọi lúc'),
    ('GET', '/notifications/user', 'Hòm thông báo học viên'),
    ('GET', '/notifications/unread-count', 'Số lượng thông báo chưa đọc'),
    ('GET', '/blog', 'Danh sách bài viết Cẩm nang Blog'),
    ('GET', '/video/lessons', 'Danh sách Video bài giảng'),
]

passed_count = 0
failed_count = 0

for item in endpoints:
    method = item[0]
    path = item[1]
    name = item[2]
    body = item[3] if len(item) > 3 else None
    
    full_url = f"{BASE_URL}{path}"
    start_time = time.time()
    
    try:
        if method == 'GET':
            res = requests.get(full_url, timeout=15)
        else:
            res = requests.post(full_url, json=body, timeout=15)
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        if res.status_code in [200, 304]:
            print(f"  ✅ [PASS] {method} {path[:40]:<40} | {elapsed_ms:>4}ms | {name}")
            passed_count += 1
        else:
            print(f"  ❌ [FAIL] {method} {path[:40]:<40} | HTTP {res.status_code} | {name}")
            failed_count += 1
    except Exception as e:
        print(f"  ❌ [ERROR] {method} {path[:40]:<40} | Lỗi kết nối: {str(e)[:40]}")
        failed_count += 1

print("\n" + "=" * 75)
print(f"🏆 KẾT QUẢ KIỂM TOÁN TẤT CẢ API PRODUCTION: {passed_count} PASSED, {failed_count} FAILED")
print("=" * 75)

client_assert = (failed_count == 0)
sys.exit(0 if client_assert else 1)
