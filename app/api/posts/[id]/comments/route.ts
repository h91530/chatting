import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(supabaseUrl, supabaseKey)

// POST: 댓글 추가
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

    const body = await request.json()
    const { content } = body

    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: '댓글 내용을 입력해주세요' },
        { status: 400 }
      )
    }

    // 댓글 추가
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        content: content.trim(),
      })
      .select(`
        id,
        content,
        created_at,
        user_id,
        users (
          id,
          username,
          avatar
        )
      `)
      .single()

    if (error) {
      console.error('Comment creation error:', error)
      return NextResponse.json(
        { message: '댓글 등록에 실패했습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comment error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// GET: 게시물의 댓글 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params

    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        users (
          id,
          username,
          avatar
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json(
        { message: '댓글을 불러올 수 없습니다' },
        { status: 500 }
      )
    }

    return NextResponse.json(comments || [])
  } catch (error) {
    console.error('Comments fetch error:', error)
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
