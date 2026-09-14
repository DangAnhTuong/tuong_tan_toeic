import sys, re, requests
from pymongo import MongoClient

sys.stdout.reconfigure(encoding='utf-8')

client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['tuong_tan_toeic']

def heal_media():
    print("==================================================================")
    print("🚀 BẮT ĐẦU SỬA CHỮA 67 LINK MEDIA CDN (AUDIO & ẢNH ETS)")
    print("==================================================================\n")

    healed_toeicmentors_count = 0
    healed_test01_count = 0

    # Pattern 1: toeicmentors 2024 Test 08 -> Supabase 2024 Test_08
    # Pattern 2: Supabase 2023 Test 01 -> Supabase 2023 TEST_1

    for col_name in ['listeningexercises', 'mocktests']:
        col = db[col_name]
        for doc in col.find({}):
            modified = False
            
            # Check doc-level audioUrl
            if doc.get('audioUrl'):
                u = doc['audioUrl']
                if 'data.toeicmentors.com/ets2024/Test_08/' in u:
                    doc['audioUrl'] = u.replace('https://data.toeicmentors.com/ets2024/Test_08/', 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2024/Test_08/')
                    healed_toeicmentors_count += 1
                    modified = True
                elif '/2023/Test 01/' in u or '/2023/Test%2001/' in u:
                    doc['audioUrl'] = u.replace('/2023/Test 01/', '/2023/TEST_1/').replace('/2023/Test%2001/', '/2023/TEST_1/')
                    healed_test01_count += 1
                    modified = True

            items = doc.get('questions') or doc.get('items') or []
            for it in items:
                if it.get('audioUrl'):
                    u = it['audioUrl']
                    if 'data.toeicmentors.com/ets2024/Test_08/' in u:
                        it['audioUrl'] = u.replace('https://data.toeicmentors.com/ets2024/Test_08/', 'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2024/Test_08/')
                        healed_toeicmentors_count += 1
                        modified = True
                    elif '/2023/Test 01/' in u or '/2023/Test%2001/' in u:
                        it['audioUrl'] = u.replace('/2023/Test 01/', '/2023/TEST_1/').replace('/2023/Test%2001/', '/2023/TEST_1/')
                        healed_test01_count += 1
                        modified = True

            if modified:
                update_doc = {}
                if doc.get('audioUrl'):
                    update_doc['audioUrl'] = doc['audioUrl']
                if doc.get('questions') is not None:
                    update_doc['questions'] = doc['questions']
                if doc.get('items') is not None:
                    update_doc['items'] = doc['items']
                col.update_one({'_id': doc['_id']}, {'$set': update_doc})

    print(f"✅ Đã cập nhật xong trong MongoDB:")
    print(f"  - Số vị trí cập nhật link toeicmentors -> Supabase CDN: {healed_toeicmentors_count}")
    print(f"  - Số vị trí cập nhật link 2023/Test 01 -> 2023/TEST_1: {healed_test01_count}")
    print(f"  - Tổng số vị trí cập nhật: {healed_toeicmentors_count + healed_test01_count}")

def verify_healed():
    print("\n🔍 Kiểm tra lại tất cả 67 URLs sau khi sửa chữa...")
    import json
    with open('scripts/media_audit_failures.json', 'r', encoding='utf-8') as f:
        fails = json.load(f)

    headers = {'User-Agent': 'Mozilla/5.0'}
    all_ok = True
    for idx, item in enumerate(fails):
        orig_url = item['url']
        fixed_url = orig_url.replace(
            'https://data.toeicmentors.com/ets2024/Test_08/',
            'https://qfhmnlvgweznzcsoijyr.supabase.co/storage/v1/object/public/mock-test-media/2024/Test_08/'
        ).replace('/2023/Test 01/', '/2023/TEST_1/').replace('/2023/Test%2001/', '/2023/TEST_1/')

        r = requests.head(fixed_url, headers=headers, timeout=5)
        if r.status_code != 200:
            print(f"  ❌ Lỗi: {fixed_url} -> Status {r.status_code}")
            all_ok = False

    if all_ok:
        print(f"🏆 TUYỆT VỜI: 67 / 67 URLs ĐÃ TRUY CẬP THÀNH CÔNG VỚI HTTP 200 OK (100.00%)!")
    else:
        print("⚠️ Vẫn còn một số URL bị lỗi.")

if __name__ == '__main__':
    heal_media()
    verify_healed()
