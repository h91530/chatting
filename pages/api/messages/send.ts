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
    const { conversationId, content } = req.body

    if (!conversationId || !content) {
      return res.status(400).json({ success: false, message: '필수 필드를 입력하세요' })
    }

    // 메시지 저장
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: decoded.id,
          content,
        },
      ])
      .select()
      .single()

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(201).json({
      success: true,
      message: data,
    })
  } catch (error) {
    console.error('Send message error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
