import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey)

export async function GET(request: NextRequest) {
  try {
    // 쿠키에서 user_id 가져오기
    const userId = request.cookies.get('user_id')?.value
    const headerUserId = request.headers.get('x-user-id')

    const currentUserId = userId || headerUserId

    // 로그인하지 않은 경우 null 반환
    if (!currentUserId) {
      return NextResponse.json({
        user: null
      })
    }

    // 데이터베이스에서 사용자 정보 조회
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, avatar, bio')
      .eq('id', currentUserId)
      .single()

    if (error || !user) {
      return NextResponse.json({
        user: null
      })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
      }
    })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ user: null })
  }
}
