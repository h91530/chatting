# -*- coding: utf-8 -*-
from playwright.sync_api import sync_playwright
import time
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # API 요청 모니터링
    api_calls = []
    
    def handle_response(response):
        if '/api/posts/' in response.url and '/like' in response.url:
            try:
                api_calls.append({
                    'url': response.url,
                    'method': response.request.method,
                    'status': response.status,
                    'body': response.text() if response.status < 400 else 'error'
                })
                print(f"\n🔹 API Response captured:")
                print(f"   URL: {response.url}")
                print(f"   Status: {response.status}")
                print(f"   Body: {response.text()[:200]}")
            except:
                pass

    page.on('response', handle_response)

    try:
        print("1️⃣ 로그인 페이지 이동...")
        page.goto('http://localhost:3000/login')
        page.wait_for_load_state('networkidle')
        
        print("2️⃣ 로그인 중...")
        page.fill('input[type="email"]', 'h91530@naver.com')
        page.fill('input[type="password"]', 'password123')
        page.click('button:has-text("로그인")')
        page.wait_for_load_state('networkidle')
        
        try:
            page.wait_for_url('**/feed', timeout=5000)
        except:
            pass
        
        time.sleep(2)
        print(f"   Current URL: {page.url}")
        
        print("\n3️⃣ 게시물 찾기...")
        posts = page.locator('article')
        print(f"   게시물 수: {posts.count()}")
        
        if posts.count() > 0:
            print("\n4️⃣ 첫 번째 게시물의 좋아요 버튼 찾기...")
            first_post = posts.nth(0)
            buttons = first_post.locator('button')
            print(f"   버튼 수: {buttons.count()}")
            
            if buttons.count() > 0:
                print("\n5️⃣ 좋아요 버튼 클릭...")
                like_button = buttons.nth(0)
                like_button.click()
                
                print("   클릭됨! API 응답 대기 중...")
                time.sleep(3)
                
                print(f"\n6️⃣ 캡처된 API 호출:")
                if api_calls:
                    for i, call in enumerate(api_calls):
                        print(f"\n   호출 {i+1}:")
                        print(f"   - URL: {call['url']}")
                        print(f"   - Method: {call['method']}")
                        print(f"   - Status: {call['status']}")
                        print(f"   - Body: {call['body']}")
                else:
                    print("   API 호출이 캡처되지 않음!")
                
                print("\n7️⃣ 페이지 상태 확인...")
                current_url = page.url
                print(f"   URL: {current_url}")
                
                # 게시물 좋아요 수 확인
                posts = page.locator('article')
                if posts.count() > 0:
                    first_post_text = posts.nth(0).text_content()
                    print(f"   첫 게시물 텍스트: {first_post_text[:100]}")

    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        
    finally:
        time.sleep(2)
        browser.close()

