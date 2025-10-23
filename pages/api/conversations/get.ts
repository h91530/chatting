import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-insecure'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res)
  } else if (req.method === 'POST') {
    return handlePost(req, res)
  }
  return res.status(405).json({ success: false, message: 'Method not allowed' })
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ success: false, message: '인증되지 않음' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }

    // 내 대화 목록 조회
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .or(`user1_id.eq.${decoded.id},user2_id.eq.${decoded.id}`)
      .order('updated_at', { ascending: false })

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      conversations: conversations || [],
    })
  } catch (error) {
    console.error('Get conversations error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ success: false, message: '인증되지 않음' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    const { friendId } = req.body

    if (!friendId) {
      return res.status(400).json({ success: false, message: 'friendId를 입력하세요' })
    }

    // 기존 대화 확인
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(user1_id.eq.${decoded.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${decoded.id})`
      )
      .single()

    if (existingConv) {
      return res.status(200).json({
        success: true,
        conversation: existingConv,
      })
    }

    // 새 대화 생성
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert([
        {
          user1_id: decoded.id,
          user2_id: friendId,
        },
      ])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(201).json({
      success: true,
      conversation: newConv,
    })
  } catch (error) {
    console.error('Create conversation error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
