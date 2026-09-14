from playwright.sync_api import sync_playwright
import time

url = "https://www.scribd.com/embeds/515447322/content"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1280, "height": 960}, device_scale_factor=2)
    print("Navigating to embed...")
    page.goto(url, wait_until="networkidle")
    time.sleep(2)
    
    # Check what global variables exist
    globals_info = page.evaluate("""() => {
        return {
            hasDocManager: typeof window.docManager !== 'undefined',
            hasScribd: typeof window.Scribd !== 'undefined',
            title: document.title,
            pageCount: document.querySelectorAll('.outer_page').length,
            totalPagesText: document.querySelector('.total_pages')?.innerText || '',
            currentPageText: document.querySelector('.current_page')?.innerText || ''
        };
    }""")
    print("Globals info:", globals_info)
    
    # Test taking a screenshot of page 1 container
    page1_el = page.query_selector(".document_scroller, .page_container, .outer_page, #outer_page_1")
    if page1_el:
        page1_el.screenshot(path="test_playwright_page1.png")
        print("Captured test_playwright_page1.png")
    else:
        page.screenshot(path="test_playwright_full.png")
        print("Captured test_playwright_full.png")
        
    # Check navigation methods
    nav_methods = page.evaluate("""() => {
        let keys = [];
        if (window.docManager) {
            keys = Object.getOwnPropertyNames(Object.getPrototypeOf(window.docManager));
        }
        return keys;
    }""")
    print("docManager methods:", nav_methods)
    
    browser.close()
