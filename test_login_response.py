# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    responses_data = []

    def handle_response(response):
        if '/api/auth/login' in response.url:
            try:
                body = response.text()
                responses_data.append({
                    'status': response.status,
                    'body': body
                })
                print(f"\nAPI Response captured:")
                print(f"Status: {response.status}")
                print(f"Body: {body[:500]}")
            except:
                pass

    page.on('response', handle_response)

    try:
        print("Going to login page...")
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')

        print("Filling login form...")
        page.fill('input[type="email"]', 'h91530@naver.com')
        page.fill('input[type="password"]', 'password123')

        print("Submitting form...")
        page.click('button:has-text("로그인")')

        # 네트워크 안정화 대기
        page.wait_for_load_state('networkidle')
        time.sleep(2)

        # 리다이렉트 대기
        try:
            page.wait_for_url('**/feed', timeout=5000)
        except:
            print("   (No redirect to /feed yet)")

        print(f"\nTotal API responses captured: {len(responses_data)}")
        for i, resp in enumerate(responses_data):
            print(f"\nResponse {i+1}:")
            print(f"  Status: {resp['status']}")
            print(f"  Body: {resp['body']}")

        print(f"\nCurrent URL: {page.url}")

        # 페이지 에러 확인
        error_divs = page.locator('.auth-error')
        if error_divs.count() > 0:
            error_text = error_divs.first.text_content()
            print(f"\nError message on page: {error_text}")

        # 쿠키 확인
        print("\nCookies:")
        cookies = page.context.cookies()
        for cookie in cookies:
            print(f"  {cookie['name']}: {cookie['value'][:50] if len(cookie['value']) > 50 else cookie['value']}")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

    finally:
        time.sleep(2)
        browser.close()
