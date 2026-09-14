import requests
import json
import os
import re

url = "https://dautoeic.com/video"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

r = requests.get(url, headers=headers)
print("Status code:", r.status_code)

output_path = r"a:\frontend\tuong_tan_toeic\backend\temp_dautoeic_raw\dautoeic_video_data.json"

if "__NEXT_DATA__" in r.text:
    data_str = r.text.split('__NEXT_DATA__" type="application/json">')[1].split("</script>")[0]
    data = json.loads(data_str)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("SUCCESS: Extracted full Next.js page data!")
else:
    # Look for API endpoints in the page or Next chunk files
    print("Parsing HTML and script chunks...")
    script_urls = re.findall(r'src="(/_next/static/chunks/[^"]+)"', r.text)
    print(f"Found {len(script_urls)} chunks!")
    with open(output_path.replace('.json', '.html'), 'w', encoding='utf-8') as f:
        f.write(r.text)
