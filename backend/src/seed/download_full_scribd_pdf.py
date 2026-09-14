import os
import time
import sys
import img2pdf
from playwright.sync_api import sync_playwright

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

OUTPUT_DIR = r"a:\frontend\tuong_tan_toeic\scribd_download"
TEMP_DIR = os.path.join(OUTPUT_DIR, "temp_pages")
FINAL_PDF = os.path.join(OUTPUT_DIR, "Introduction_to_pre_processing_with_ANSA.pdf")
URL = "https://www.scribd.com/embeds/515447322/content"

os.makedirs(TEMP_DIR, exist_ok=True)

print("[INFO] Bat dau trich xuat tai lieu Scribd ANSA (214 trang)...")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    # device_scale_factor=2 ensures sharp, high-res text and graphics
    page = browser.new_page(viewport={"width": 1400, "height": 1050}, device_scale_factor=2)
    
    print("[INFO] Dang ket noi toi may chu Scribd Embed...")
    page.goto(URL, wait_until="networkidle", timeout=60000)
    time.sleep(2)
    
    # Get total page count dynamically
    total_pages = page.evaluate("() => window.docManager ? window.docManager.pageCount() : 214")
    print(f"[INFO] Tong so trang phat hien: {total_pages} trang")
    
    image_paths = []
    
    for page_num in range(1, total_pages + 1):
        img_path = os.path.join(TEMP_DIR, f"page_{page_num:03d}.png")
        
        # Trigger page display and scroll into view for lazy loading
        page.evaluate(f"""() => {{
            let el = document.getElementById('outer_page_{page_num}');
            if (el) el.scrollIntoView();
            if (window.docManager) window.docManager.gotoPage({page_num});
        }}""")
        
        # Wait up to 5s for image layer and img.absimg to be fully loaded and rendered
        for _ in range(25):
            ready = page.evaluate(f"""() => {{
                let el = document.getElementById('outer_page_{page_num}');
                if (!el) return false;
                let np = el.querySelector('.newpage');
                if (!np) return false;
                
                // If page has an image layer, require img.absimg to be complete with naturalWidth
                let imgLayer = el.querySelector('.image_layer');
                if (imgLayer) {{
                    let img = el.querySelector('img.absimg');
                    if (!img) return false;
                    return img.complete && img.naturalWidth > 0;
                }}
                return true;
            }}""")
            if ready:
                break
            time.sleep(0.15)
            
        # Small settling wait for paint
        time.sleep(0.15)
        
        # Locate exact page content
        el = page.query_selector(f"#outer_page_{page_num} .newpage")
        if not el:
            el = page.query_selector(f"#outer_page_{page_num}")
            
        if el:
            el.screenshot(path=img_path)
            image_paths.append(img_path)
        else:
            print(f"[WARN] Khong tim thay selector cho trang {page_num}, chup fallback.")
            fallback_el = page.query_selector(".document_scroller") or page
            fallback_el.screenshot(path=img_path)
            image_paths.append(img_path)
            
        if page_num % 10 == 0 or page_num == total_pages:
            print(f"[PROGRESS] Da tai {page_num}/{total_pages} trang ({(page_num/total_pages*100):.1f}%)")
            sys.stdout.flush()

    browser.close()

print(f"[SUCCESS] Da trich xuat thanh cong toan bo {len(image_paths)} trang anh chat luong cao!")
print("[INFO] Dang dong goi va ghep thanh file PDF hoan chinh...")

with open(FINAL_PDF, "wb") as f:
    f.write(img2pdf.convert(image_paths))

file_size_mb = os.path.getsize(FINAL_PDF) / (1024 * 1024)
print("[COMPLETED] File PDF da duoc luu tai:")
print(f"PATH: {FINAL_PDF}")
print(f"SIZE: {file_size_mb:.2f} MB")

# Clean up temp images
for p in image_paths:
    try:
        os.remove(p)
    except:
        pass
try:
    os.rmdir(TEMP_DIR)
except:
    pass
print("[DONE] Da don dep cac tep anh tam thoi.")
