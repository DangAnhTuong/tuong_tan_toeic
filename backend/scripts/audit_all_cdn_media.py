import sys, os, time, json
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests
from pymongo import MongoClient

sys.stdout.reconfigure(encoding='utf-8')

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

def collect_urls():
    print("1. Thu thập toàn bộ URL Media (Audio & Ảnh) từ MongoDB...")
    
    # 1. Mock Tests
    mock_urls = {} # url -> list of {test, qNum, type}
    for t in db['mocktests'].find({}):
        title = t.get('title', 'Unknown')
        if t.get('audioUrl'):
            u = t['audioUrl'].strip()
            mock_urls.setdefault(u, []).append({'source': 'mocktest-header', 'test': title, 'type': 'audio'})
        for q in t.get('questions', []):
            num = q.get('questionNum')
            if q.get('audioUrl'):
                u = q['audioUrl'].strip()
                mock_urls.setdefault(u, []).append({'source': 'mocktest-question', 'test': title, 'qNum': num, 'type': 'audio'})
            if q.get('imageUrl'):
                u = q['imageUrl'].strip()
                mock_urls.setdefault(u, []).append({'source': 'mocktest-question', 'test': title, 'qNum': num, 'type': 'image'})

    print(f"  - Mock Tests: {len(mock_urls)} URL duy nhất")

    # 2. Listening exercises
    listening_urls = {} # url -> list of {doc, idx, type}
    for doc in db['listeningexercises'].find({}):
        title = doc.get('title', 'Unknown')
        if doc.get('audioUrl'):
            u = doc['audioUrl'].strip()
            listening_urls.setdefault(u, []).append({'source': 'listening-header', 'doc': title, 'type': 'audio'})
        
        items = doc.get('questions') or doc.get('items') or []
        for idx, it in enumerate(items):
            if it.get('audioUrl'):
                u = it['audioUrl'].strip()
                listening_urls.setdefault(u, []).append({'source': 'listening-item', 'doc': title, 'idx': idx, 'type': 'audio'})
            if it.get('imageUrl'):
                u = it['imageUrl'].strip()
                listening_urls.setdefault(u, []).append({'source': 'listening-item', 'doc': title, 'idx': idx, 'type': 'image'})

    print(f"  - Listening Exercises: {len(listening_urls)} URL duy nhất")

    return mock_urls, listening_urls

def check_single_url(url, timeout=6):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    for attempt in range(2):
        try:
            r = requests.head(url, headers=headers, timeout=timeout, allow_redirects=True)
            if r.status_code == 200:
                return url, 200, r.headers.get('Content-Length'), r.headers.get('Content-Type')
            elif r.status_code == 405:
                # Some CDN servers disallow HEAD, try GET with range bytes=0-10
                r_get = requests.get(url, headers={**headers, 'Range': 'bytes=0-10'}, timeout=timeout)
                if r_get.status_code in (200, 206):
                    return url, 200, r_get.headers.get('Content-Length'), r_get.headers.get('Content-Type')
                return url, r_get.status_code, None, None
            else:
                return url, r.status_code, None, None
        except requests.exceptions.Timeout:
            if attempt == 1:
                return url, 408, None, 'Timeout'
            time.sleep(0.5)
        except Exception as e:
            if attempt == 1:
                return url, 599, None, str(e)
            time.sleep(0.5)
    return url, 599, None, 'Unknown error'

def scan_urls(url_dict, label, max_workers=35):
    urls = list(url_dict.keys())
    total = len(urls)
    print(f"\n2. Bắt đầu quét {total} URL [{label}] với {max_workers} luồng song song...")

    results = {
        'total': total,
        'ok': 0,
        'failed': 0,
        'status_counts': {},
        'failures': []
    }

    t0 = time.time()
    completed = 0

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_url = {executor.submit(check_single_url, u): u for u in urls}

        for future in as_completed(future_to_url):
            url, status, length, ctype = future.result()
            completed += 1

            results['status_counts'][status] = results['status_counts'].get(status, 0) + 1

            if status == 200:
                results['ok'] += 1
            else:
                results['failed'] += 1
                results['failures'].append({
                    'url': url,
                    'status': status,
                    'error': ctype,
                    'references': url_dict[url]
                })

            if completed % 200 == 0 or completed == total:
                elapsed = time.time() - t0
                rate = completed / elapsed if elapsed > 0 else 0
                print(f"  [{label}] Tiến độ: {completed}/{total} ({completed*100/total:.1f}%) - Tốc độ: {rate:.1f} URLs/giây - OK: {results['ok']}, Lỗi: {results['failed']}")

    return results

def main():
    print("==================================================================")
    print("🌐 KIỂM TOÁN TOÀN DIỆN MỤC 3: QUÉT 100% LINK MEDIA AUDIO & ẢNH ETS")
    print("==================================================================\n")

    mock_urls, listening_urls = collect_urls()

    # Phase 1: Audit Mock Tests Media (The 10 ETS Tests)
    mock_results = scan_urls(mock_urls, label="ETS MOCK TESTS (10 BỘ ĐỀ)")

    # Phase 2: Audit Listening Practice & Dictation Media
    listening_results = scan_urls(listening_urls, label="LISTENING & DICTATION")

    # Combine report
    total_scanned = mock_results['total'] + listening_results['total']
    total_ok = mock_results['ok'] + listening_results['ok']
    total_failed = mock_results['failed'] + listening_results['failed']

    print("\n==================================================================")
    print("📊 BÁO CÁO TỔNG KẾT TOÀN DIỆN KIỂM TOÁN MEDIA CDN")
    print("==================================================================")
    print(f"1. BỘ ĐỀ THI ETS MOCK TESTS (10 BỘ ĐỀ):")
    print(f"   - Tổng số URL kiểm tra: {mock_results['total']}")
    print(f"   - Số URL 200 OK: {mock_results['ok']} ({mock_results['ok']*100/mock_results['total']:.2f}%)")
    print(f"   - Số URL lỗi (404/400/hỏng): {mock_results['failed']}")
    print(f"   - Phân bố HTTP Status: {mock_results['status_counts']}")

    print(f"\n2. PHÂN HỆ LUYỆN NGHE & CHÉP CHÍNH TẢ:")
    print(f"   - Tổng số URL kiểm tra: {listening_results['total']}")
    print(f"   - Số URL 200 OK: {listening_results['ok']} ({listening_results['ok']*100/listening_results['total']:.2f}%)")
    print(f"   - Số URL lỗi: {listening_results['failed']}")
    print(f"   - Phân bố HTTP Status: {listening_results['status_counts']}")

    print(f"\n3. TỔNG TOÀN NỀN TẢNG:")
    print(f"   - Tổng số URL Media đã quét thực tế: {total_scanned.toLocaleString() if hasattr(total_scanned, 'toLocaleString') else total_scanned}")
    print(f"   - Số URL 200 OK: {total_ok} ({total_ok*100/total_scanned:.2f}%)")
    print(f"   - Tổng số lỗi phát hiện: {total_failed}")

    # Save detailed failure report if any
    all_failures = mock_results['failures'] + listening_results['failures']
    with open('scripts/media_audit_failures.json', 'w', encoding='utf-8') as f:
        json.dump(all_failures, f, ensure_ascii=False, indent=2)

    if total_failed > 0:
        print(f"\n⚠️ Đã lưu {total_failed} URL bị lỗi vào file 'scripts/media_audit_failures.json'.")
        print("Một số URL lỗi tiêu biểu:")
        for fail in all_failures[:10]:
            print(f"  - [{fail['status']}] {fail['url']}")
            print(f"    Refs: {fail['references'][0]}")
    else:
        print("\n🏆 KẾT LUẬN: 100.00% LINK MEDIA AUDIO VÀ ẢNH TRÊN HỆ THỐNG HOẠT ĐỘNG HOÀN HẢO!")

if __name__ == '__main__':
    main()
