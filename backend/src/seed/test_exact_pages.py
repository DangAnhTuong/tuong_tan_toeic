from playwright.sync_api import sync_playwright
import time

url = "https://www.scribd.com/embeds/515447322/content"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 960}, device_scale_factor=2)
    page.goto(url, wait_until="networkidle")
    time.sleep(1)
    
    for page_num in range(1, 4):
        # Navigate using docManager
        page.evaluate(f"window.docManager.gotoPage({page_num})")
        time.sleep(0.5)
        
        # Query outer page or page inner
        el = page.query_selector(f"#outer_page_{page_num} .newpage, #outer_page_{page_num}")
        if el:
            # Wait for images to load inside this page
            page.evaluate(f"""() => {{
                let p = document.getElementById('outer_page_{page_num}');
                if (p) {{
                    let imgs = p.querySelectorAll('img');
                    imgs.forEach(img => {{
                        if (img.getAttribute('orig') && !img.src) {{
                            img.src = img.getAttribute('orig');
                        }}
                    }});
                }}
            }}""")
            time.sleep(0.3)
            el.screenshot(path=f"test_exact_page{page_num}.png")
            print(f"Captured page {page_num} successfully!")
            
    browser.close()
