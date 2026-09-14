import sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from pymongo import MongoClient

sys.stdout.reconfigure(encoding='utf-8')

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

def verify_mock_tests():
    print("==================================================================")
    print("🎯 KIỂM TOÁN TỔNG LỰC TOÀN BỘ MEDIA 10 BỘ ĐỀ ETS 2026 MOCK TESTS")
    print("==================================================================\n")

    tests = list(db['mocktests'].find({}))
    print(f"Tổng số bộ đề thi: {len(tests)} đề")

    audio_urls = set()
    image_urls = set()

    for t in tests:
        if t.get('audioUrl'):
            audio_urls.add(t['audioUrl'].strip())
        for q in t.get('questions', []):
            if q.get('audioUrl'):
                audio_urls.add(q['audioUrl'].strip())
            if q.get('imageUrl'):
                image_urls.add(q['imageUrl'].strip())

    print(f"  - Số Audio URLs độc nhất: {len(audio_urls)}")
    print(f"  - Số Image URLs độc nhất: {len(image_urls)}")
    total_urls = list(audio_urls | image_urls)
    print(f"  - Tổng cộng: {len(total_urls)} URLs độc nhất cần kiểm tra\n")

    headers = {'User-Agent': 'Mozilla/5.0'}
    
    def check_url(u):
        try:
            r = requests.head(u, headers=headers, timeout=6, allow_redirects=True)
            return u, r.status_code
        except Exception as e:
            return u, str(e)

    failed = []
    success_count = 0
    t0 = time.time()

    with ThreadPoolExecutor(max_workers=30) as executor:
        futures = {executor.submit(check_url, u): u for u in total_urls}
        for f in as_completed(futures):
            u, status = f.result()
            if status == 200:
                success_count += 1
            else:
                failed.append((u, status))

    print(f"Thời gian kiểm tra: {time.time() - t0:.2f}s")
    print(f"Kết quả: {success_count}/{len(total_urls)} URLs trả về HTTP 200 OK ({success_count*100/len(total_urls):.2f}%)")
    print(f"Số lỗi: {len(failed)}")

    if failed:
        print("Chi tiết lỗi:", failed)
    else:
        print("\n🏆 KẾT LUẬN: 100.00% MEDIA (AUDIO CDN & ẢNH ETS) CỦA 10 BỘ ĐỀ THI ĐÃ TRUY CẬP THÀNH CÔNG VỚI HTTP 200 OK!")

if __name__ == '__main__':
    verify_mock_tests()
