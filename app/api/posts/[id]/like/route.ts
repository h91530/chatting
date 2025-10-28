import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// POST: 게시물에 좋아요 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 현재 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 이미 좋아요하고 있는지 확인
    const { data: existing } = await supabase
      .from('post_likes')
      .select()
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: '이미 좋아요를 눌렀습니다' },
        { status: 400 }
      )
    }

    // 좋아요 추가
    const { error: likeError } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      })

    if (likeError) {
      return NextResponse.json(
        { message: '좋아요 추가에 실패했습니다' },
        { status: 500 }
      )
    }

    // 게시물의 좋아요 수 증가
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single()

    const newLikesCount = (post?.likes_count || 0) + 1

    await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', postId)

    return NextResponse.json({
      message: '좋아요를 눌렀습니다',
      success: true,
      likes_count: newLikesCount
    })
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// DELETE: 좋아요 취소
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    // 현재 사용자 ID 가져오기
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 좋아요 제거
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)

    if (error) {
      return NextResponse.json(
        { message: '좋아요 취소에 실패했습니다' },
        { status: 500 }
      )
    }

    // 게시물의 좋아요 수 감소
    const { data: post } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single()

    const newLikesCount = Math.max((post?.likes_count || 1) - 1, 0)

    await supabase
      .from('posts')
      .update({ likes_count: newLikesCount })
      .eq('id', postId)

    return NextResponse.json({
      message: '좋아요를 취소했습니다',
      success: true,
      likes_count: newLikesCount
    })
  } catch (error) {
    console.error('Unlike error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
