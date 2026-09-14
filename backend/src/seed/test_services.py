import requests

url = "https://www.scribd.com/document/515447322/Introduction-to-pre-processing-with-ANSA"

services = [
    ("https://docdownloader.com/", "docdownloader"),
    ("https://scribdfree.com/", "scribdfree"),
    ("https://scribd.vdownloaders.com/", "vdownloaders"),
    ("https://downscribd.com/", "downscribd"),
]

for base, name in services:
    try:
        r = requests.get(base, timeout=5)
        print(f"{name}: status {r.status_code}")
    except Exception as e:
        print(f"{name}: failed ({e})")
