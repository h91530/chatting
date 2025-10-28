from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # 1. 로그인 페이지로 이동
    print("1. 로그인 페이지로 이동...")
    page.goto('http://localhost:3003/login')
    page.wait_for_load_state('networkidle')
    page.screenshot(path='/tmp/login_page.png', full_page=True)
    print("   ✓ 로그인 페이지 로드 완료")

    # 2. 로그인 정보 입력
    print("\n2. 로그인 정보 입력...")
    page.fill('input[type="email"]', 'yangtae@test.com')
    page.fill('input[type="password"]', 'password123')
    page.screenshot(path='/tmp/login_filled.png', full_page=True)
    print("   ✓ 이메일과 비밀번호 입력 완료")

    # 3. 로그인 버튼 클릭
    print("\n3. 로그인 버튼 클릭...")
    page.click('button:has-text("로그인")')
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    page.screenshot(path='/tmp/after_login.png', full_page=True)
    print("   ✓ 로그인 완료")

    # 4. 로컬 스토리지 확인
    print("\n4. 로컬 스토리지 확인...")
    user_id = page.evaluate("() => localStorage.getItem('user_id')")
    user_email = page.evaluate("() => localStorage.getItem('user_email')")
    user_username = page.evaluate("() => localStorage.getItem('user_username')")
    print(f"   user_id: {user_id}")
    print(f"   user_email: {user_email}")
    print(f"   user_username: {user_username}")

    # 5. 피드 페이지 확인
    print("\n5. 현재 URL 확인...")
    current_url = page.url
    print(f"   현재 URL: {current_url}")

    # 6. 게시물 찾기
    print("\n6. 게시물 찾기...")
    posts = page.locator('article')
    post_count = posts.count()
    print(f"   게시물 개수: {post_count}")

    if post_count > 0:
        # 7. 첫 번째 게시물의 좋아요 버튼 찾기
        print("\n7. 첫 번째 게시물의 좋아요 버튼 클릭...")
        first_post = posts.nth(0)

        # 좋아요 버튼 찾기 (SVG 아이콘)
        like_button = first_post.locator('button').nth(0)
        page.screenshot(path='/tmp/before_like.png', full_page=True)

        print("   좋아요 버튼을 클릭합니다...")
        like_button.click()

        # 결과 확인
        page.wait_for_timeout(1000)
        page.screenshot(path='/tmp/after_like.png', full_page=True)
        print("   ✓ 좋아요 버튼 클릭 완료")

        # 8. 네트워크 로그 확인
        print("\n8. 브라우저 콘솔 로그 확인...")
        logs = page.evaluate("() => window.__logs || []")
        print(f"   콘솔 로그: {logs}")

        # 9. 알림 확인
        print("\n9. 알림 메시지 확인...")
        alert_text = page.locator('.alert, [role="alert"]').first.text_content() if page.locator('.alert, [role="alert"]').count() > 0 else "알림 없음"
        print(f"   알림: {alert_text}")

    print("\n✓ 테스트 완료!")
    browser.close()
