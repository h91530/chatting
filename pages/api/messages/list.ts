import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-insecure'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ success: false, message: '인증되지 않음' })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string }
    const { conversationId } = req.query

    if (!conversationId) {
      return res.status(400).json({ success: false, message: 'conversationId를 입력하세요' })
    }

    // 메시지 조회
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      messages: messages || [],
    })
  } catch (error) {
    console.error('List messages error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
