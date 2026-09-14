import requests
import re

url = 'https://html.scribdassets.com/4un137tsqo8snajv/pages/4-494f111998.jsonp'
r = requests.get(url)
print("Length of jsonp:", len(r.text))

# Let's inspect any img tags or image layer
for line in r.text.split('\\n'):
    if 'img' in line or 'image' in line or 'jpg' in line or 'png' in line or 'webp' in line or 'svg' in line:
        print("MATCH:", line[:200])

# Print the last 1000 characters
print("END OF JSONP:", r.text[-1500:])
