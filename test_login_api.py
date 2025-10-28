# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time
import json

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # Network 로그 캡처
    responses = []

    def handle_response(response):
        if '/api/auth/login' in response.url:
            responses.append({
                'url': response.url,
                'status': response.status,
                'body': response.text() if response.ok else None
            })

    page.on('response', handle_response)

    try:
        print("1. Navigating to login page...")
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')
        print("   OK")

        print("\n2. Entering credentials...")
        page.fill('input[type="email"]', 'yangtae@test.com')
        page.fill('input[type="password"]', 'password123')
        print("   OK")

        print("\n3. Submitting login form...")
        page.click('button:has-text("로그인")')

        # API 응답 기다리기
        time.sleep(3)

        print("\n4. Checking API responses...")
        if responses:
            for resp in responses:
                print(f"   Status: {resp['status']}")
                print(f"   URL: {resp['url']}")
                if resp['body']:
                    try:
                        body = json.loads(resp['body'])
                        print(f"   Response: {json.dumps(body, indent=2)}")
                    except:
                        print(f"   Response: {resp['body'][:200]}")
        else:
            print("   No API responses captured")

        print("\n5. Current state:")
        print(f"   URL: {page.url}")

        # 콘솔 메시지 확인
        print("\n6. Browser console logs:")
        logs = page.evaluate("() => window.__logs || []")
        print(f"   Logs: {logs}")

        # 페이지 내용 검사
        print("\n7. Page content check:")
        errors = page.locator('.auth-error, [role="alert"]')
        if errors.count() > 0:
            print(f"   Error message: {errors.first.text_content()}")
        else:
            print("   No error messages visible")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

    finally:
        browser.close()
