import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key'

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params

    // 사용자 정보 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, username, created_at')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { message: '사용자를 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 사용자의 게시물 조회
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('id, title, content, image_url, created_at, likes_count')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (postsError) {
      return NextResponse.json(
        { message: '게시물을 불러올 수 없습니다' },
        { status: 500 }
      )
    }

    // 팔로워 수 조회 (follows 테이블에서 follower_id가 현재 사용자인 경우)
    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId)

    // 팔로잉 수 조회 (follows 테이블에서 following_id가 현재 사용자인 경우)
    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId)

    // 게시글 수 조회
    const { count: postsCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return NextResponse.json({
      ...user,
      posts: posts || [],
      followers_count: followersCount || 0,
      following_count: followingCount || 0,
      posts_count: postsCount || 0,
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
