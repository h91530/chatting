import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// POST: 팔로우
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params

    // 현재 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    if (userId === followingId) {
      return NextResponse.json(
        { message: '자신을 팔로우할 수 없습니다' },
        { status: 400 }
      )
    }

    // 이미 팔로우하고 있는지 확인
    const { data: existing } = await supabase
      .from('follows')
      .select()
      .eq('follower_id', userId)
      .eq('following_id', followingId)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: '이미 팔로우하고 있습니다' },
        { status: 400 }
      )
    }

    // 팔로우 추가
    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: userId,
        following_id: followingId,
      })

    if (error) {
      return NextResponse.json(
        { message: '팔로우에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: '팔로우했습니다' })
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE: 언팔로우
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params

    // 현재 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 팔로우 제거
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', userId)
      .eq('following_id', followingId)

    if (error) {
      return NextResponse.json(
        { message: '언팔로우에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: '언팔로우했습니다' })
  } catch (error) {
    console.error('Unfollow error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
