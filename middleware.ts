import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // 쿠키에서 user_id 읽기
  const userId = request.cookies.get('user_id')?.value

  // 새로운 요청 헤더에 user_id 추가
  const requestHeaders = new Headers(request.headers)
  if (userId) {
    requestHeaders.set('x-user-id', userId)
  }

  // 요청 헤더를 업데이트한 응답 반환
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return response
}

// API 라우트에만 미들웨어 적용
export const config = {
  matcher: ['/api/:path*'],
}
