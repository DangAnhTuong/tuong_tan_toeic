import sys
import requests
import json
import time

sys.stdout.reconfigure(encoding='utf-8')

LOCAL_URL = 'http://localhost:5000/api/v1'
VPS_URL = 'https://toeic.danganhtuong.dev/api/v1'

print("=" * 80)
print("⚖️  BỘ CÔNG CỤ ĐỐI CHIẾU SONG SONG DỮ LIỆU: LOCAL ⇄ VPS PRODUCTION")
print("=" * 80)

endpoints_to_compare = [
    ('Từ vựng (Số chủ đề)', '/vocab/topics', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Từ vựng (Tổng số từ)', '/vocab/topics', lambda d: sum(len(t.get('words', [])) for t in (d if isinstance(d, list) else d.get('data', [])))),
    ('Nghe Chép (Số bài Dictation)', '/listening/exercises?mode=dictation', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Luyện Nghe (Số cụm Level)', '/listening/exercises?mode=level', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Luyện Đọc (Số cụm Level)', '/reading/exercises?mode=level', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Ngữ pháp (Số chuyên đề)', '/reading/exercises?mode=grammar', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Đọc Song Ngữ (Số bài)', '/reading/exercises?mode=bilingual', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Đề Thi Thử (Số bộ đề ETS)', '/mocktest/tests', lambda d: len(d) if isinstance(d, list) else len(d.get('data', []))),
    ('Đấu Trường 1v1 (Top Elo)', '/battle/arena-info', lambda d: (d.get('data', {}).get('topRank', {}) or {}).get('elo', 0) if isinstance(d, dict) else 0),
]

print(f"{'HẠNG MỤC KIỂM TRA':<32} | {'LOCAL':<12} | {'VPS PROD':<12} | {'KẾT QUẢ':<15}")
print("-" * 80)

all_matched = True

for label, path, parser in endpoints_to_compare:
    # 1. Fetch Local
    local_val = "N/A"
    try:
        r_local = requests.get(f"{LOCAL_URL}{path}", timeout=4)
        if r_local.status_code == 200:
            local_val = parser(r_local.json())
    except Exception:
        local_val = "Offline"

    # 2. Fetch VPS
    vps_val = "N/A"
    try:
        r_vps = requests.get(f"{VPS_URL}{path}", timeout=8)
        if r_vps.status_code == 200:
            vps_val = parser(r_vps.json())
    except Exception as e:
        vps_val = f"Err: {str(e)[:7]}"

    # Compare
    status = ""
    if local_val == "Offline":
        status = "⚠️ Local chưa bật"
    elif str(local_val) == str(vps_val):
        status = "✅ KHỚP 100%"
    else:
        status = "❌ LỆCH DỮ LIỆU"
        all_matched = False

    print(f"{label:<32} | {str(local_val):<12} | {str(vps_val):<12} | {status:<15}")

print("=" * 80)
if all_matched:
    print("🎉 KẾT LUẬN: Dữ liệu giữa Local và VPS Production ĐỒNG BỘ 100%, HOÀN TOÀN AN TÂM!")
else:
    print("⚠️ CẢNH BÁO: Phát hiện có sự chênh lệch dữ liệu giữa Local và VPS. Vui lòng kiểm tra chi tiết ở trên!")
print("=" * 80)
