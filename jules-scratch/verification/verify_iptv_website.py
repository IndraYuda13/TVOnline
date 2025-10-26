from playwright.sync_api import sync_playwright, TimeoutError
import time

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    for i in range(3):
        try:
            page.goto("http://localhost:3000")
            break
        except TimeoutError:
            print(f"Connection timed out. Retrying in 5 seconds... ({i+1}/3)")
            time.sleep(5)

    page.screenshot(path="jules-scratch/verification/homepage.png")

    # Click on the first channel card to navigate to the stream page
    page.locator('.group').first.click()
    page.wait_for_url("**/stream/**")

    page.screenshot(path="jules-scratch/verification/stream_page.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
