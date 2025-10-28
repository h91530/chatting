# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time
import sys
import io

# Windows UTF-8 인코딩 설정
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    try:
        # 1. 로그인 페이지로 이동
        print("1. Going to login page...")
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')
        print("   OK")

        # 2. 로그인
        print("\n2. Logging in...")
        page.fill('input[type="email"]', 'h91530@naver.com')
        page.fill('input[type="password"]', 'password123')
        page.click('button:has-text("로그인")')
        page.wait_for_load_state('networkidle')

        # 리다이렉트 기다리기
        try:
            page.wait_for_url('**/feed', timeout=5000)
        except:
            pass

        time.sleep(2)
        print("   OK: Logged in")
        print(f"   Current URL: {page.url}")

        # 3. 쿠키 확인
        print("\n3. Checking cookies...")
        cookies = page.context.cookies()
        user_id_cookie = next((c for c in cookies if c['name'] == 'user_id'), None)
        if user_id_cookie:
            print(f"   user_id cookie: {user_id_cookie['value']}")
        else:
            print("   WARNING: No user_id cookie found!")

        # 4. 게시물 찾기
        print("\n4. Finding posts...")
        page.wait_for_load_state('networkidle')
        posts = page.locator('article')
        post_count = posts.count()
        print(f"   Found {post_count} posts")

        if post_count > 0:
            # 5. 첫 번째 게시물의 좋아요 버튼 찾기
            print("\n5. Finding like button...")
            first_post = posts.nth(0)
            buttons = first_post.locator('button')
            button_count = buttons.count()
            print(f"   Found {button_count} buttons in post")

            if button_count > 0:
                # 좋아요 버튼은 첫 번째 버튼
                like_button = buttons.nth(0)

                # 클릭 전 스크린샷
                page.screenshot(path='/tmp/before_like_click.png')

                # 6. 좋아요 버튼 클릭
                print("\n6. Clicking like button...")
                like_button.click()
                time.sleep(2)
                print("   OK: Like button clicked")

                # 클릭 후 스크린샷
                page.screenshot(path='/tmp/after_like_click.png')

                # 7. 알림 확인
                print("\n7. Checking for notifications...")
                page.screenshot(path='/tmp/before_alert_check.png')
                time.sleep(1)

                alerts = page.locator('[role="alert"]')
                alert_count = alerts.count()
                print(f"   Alert elements found: {alert_count}")

                if alert_count > 0:
                    alert_text = alerts.first.text_content()
                    print(f"   Alert text: '{alert_text}'")
                    if not alert_text or alert_text.strip() == "":
                        print("   [Empty alert - content might be hidden]")
                    elif "성공" in alert_text or "눌렀습니다" in alert_text:
                        print("   SUCCESS! Like was successful!")
                    elif "필요" in alert_text or "로그인" in alert_text:
                        print("   FAILED! Authentication error")
                    else:
                        print(f"   Alert message: {alert_text}")
                else:
                    print("   No alert found")

                # 8. 네트워크 요청 확인
                print("\n8. Checking recent API calls...")
                # 콘솔 에러 확인
                console_messages = page.evaluate("() => window.__logs || []")
                print(f"   Console logs: {console_messages}")

        print("\nTest completed!")

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        page.screenshot(path='/tmp/error_screenshot.png')

    finally:
        time.sleep(2)
        browser.close()
