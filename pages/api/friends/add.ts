import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-insecure'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ success: false, message: '인증되지 않음' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    const { friendId } = req.body

    if (!friendId) {
      return res.status(400).json({ success: false, message: '친구 ID를 입력하세요' })
    }

    // 친구 추가
    const { data, error } = await supabase
      .from('friendships')
      .insert([
        {
          user_id: decoded.id,
          friend_id: friendId,
        },
      ])
      .select()
      .single()

    if (error) {
      if (error.message.includes('duplicate')) {
        return res.status(409).json({ success: false, message: '이미 친구입니다' })
      }
      return res.status(500).json({ success: false, message: error.message })
    }

    // 친구 추가 후 대화 자동 생성
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(user1_id.eq.${decoded.id},user2_id.eq.${friendId}),and(user1_id.eq.${friendId},user2_id.eq.${decoded.id})`
      )
      .single()

    let conversation = existingConv
    if (!existingConv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert([
          {
            user1_id: decoded.id,
            user2_id: friendId,
          },
        ])
        .select()
        .single()
      conversation = newConv
    }

    return res.status(201).json({
      success: true,
      friendship: data,
      conversation: conversation,
    })
  } catch (error) {
    console.error('Add friend error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
