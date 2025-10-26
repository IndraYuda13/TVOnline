from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:3000")

    # Wait for the channel grid to be visible
    page.wait_for_selector('a[href*="/stream/"]', timeout=60000)

    page.screenshot(path="jules-scratch/verification/homepage.png")

    # Click on the first channel link to navigate to the stream page
    page.get_by_role('link').first.click()
    page.wait_for_url("**/stream/**", timeout=60000)

    page.screenshot(path="jules-scratch/verification/stream_page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
