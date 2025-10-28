from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    # 피드 페이지로 이동
    page.goto('http://localhost:3003/feed')
    page.wait_for_load_state('networkidle')

    # 페이지 스크린샷 찍기
    page.screenshot(path='/tmp/feed_page.png', full_page=True)
    print("Feed page screenshot saved")

    # 게시물이 있는지 확인
    posts = page.locator('article')
    post_count = posts.count()
    print(f"Found {post_count} posts")

    if post_count > 0:
        # 첫 번째 게시물의 "전체 보기" 버튼 클릭
        first_post = posts.nth(0)
        view_button = first_post.locator('text=전체 보기')

        if view_button.is_visible():
            print("Clicking '전체 보기' button...")
            view_button.click()

            # 모달이 나타날 때까지 기다리기
            page.wait_for_timeout(1000)
            page.screenshot(path='/tmp/modal_opened.png', full_page=True)
            print("Modal opened screenshot saved")

            # 댓글 영역 확인
            comments_section = page.locator('text=댓글')
            if comments_section.count() > 0:
                print("Comments section found!")

                # 댓글 목록 확인
                comment_items = page.locator('div:has-text("댓글을 불러오는 중"), div:has-text("아직 댓글이 없습니다"), article div.flex')
                print(f"Comment elements: {comment_items.count()}")

                # 로딩 중 메시지 확인
                loading_text = page.locator('text=댓글을 불러오는 중')
                if loading_text.count() > 0:
                    print("Loading message found, waiting for comments to load...")
                    page.wait_for_timeout(2000)
                    page.screenshot(path='/tmp/modal_comments_loaded.png', full_page=True)

                # 댓글 내용 확인
                page.screenshot(path='/tmp/modal_final.png', full_page=True)
                print("Final modal screenshot saved")
            else:
                print("Comments section NOT found")
        else:
            print("'전체 보기' button not visible")
    else:
        print("No posts found!")

    browser.close()
    print("Test completed!")
