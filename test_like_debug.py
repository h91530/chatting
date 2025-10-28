# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    try:
        # 1. 로그인 페이지로 이동
        print("1. Navigating to login page...")
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')
        print("   OK: Login page loaded")

        # 2. 로그인 정보 입력
        print("\n2. Entering login credentials...")
        page.fill('input[type="email"]', 'yangtae@test.com')
        page.fill('input[type="password"]', 'password123')
        print("   OK: Credentials entered")

        # 3. 로그인 버튼 클릭
        print("\n3. Clicking login button...")
        page.click('button:has-text("로그인")')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        print("   OK: Login completed")

        # 4. 로컬 스토리지 확인
        print("\n4. Checking localStorage...")
        user_id = page.evaluate("() => localStorage.getItem('user_id')")
        user_email = page.evaluate("() => localStorage.getItem('user_email')")
        user_username = page.evaluate("() => localStorage.getItem('user_username')")
        print(f"   user_id: {user_id}")
        print(f"   user_email: {user_email}")
        print(f"   user_username: {user_username}")

        # 5. 현재 URL 확인
        print("\n5. Current URL:", page.url)

        # 6. 게시물 찾기
        print("\n6. Finding posts...")
        page.wait_for_load_state('networkidle')
        posts = page.locator('article')
        post_count = posts.count()
        print(f"   Found {post_count} posts")

        if post_count > 0:
            print("\n7. Clicking like button on first post...")
            first_post = posts.nth(0)

            # 좋아요 버튼 찾기 (첫 번째 버튼)
            buttons = first_post.locator('button')
            button_count = buttons.count()
            print(f"   Found {button_count} buttons in post")

            if button_count > 0:
                like_button = buttons.nth(0)

                # 클릭 전 상태 캡처
                page.screenshot(path='/tmp/before_click.png', full_page=False)

                print("   Clicking like button...")
                like_button.click()

                # 결과 확인
                time.sleep(1)

                print("   OK: Like button clicked")

                # 클릭 후 상태 캡처
                page.screenshot(path='/tmp/after_click.png', full_page=False)

                # 알림 확인
                print("\n8. Checking for alerts...")
                time.sleep(1)
                alert_elements = page.locator('[role="alert"]')
                if alert_elements.count() > 0:
                    alert_text = alert_elements.first.text_content()
                    print(f"   Alert message: {alert_text}")
                else:
                    print("   No alerts found")

        print("\nTest completed!")

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

    finally:
        browser.close()
