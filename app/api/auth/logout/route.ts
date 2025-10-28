import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: '로그아웃 성공'
    })

    response.cookies.delete('user_id')

    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
