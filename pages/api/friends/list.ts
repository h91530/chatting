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

    // 친구 목록 조회
    const { data: friends, error } = await supabase
      .from('friendships')
      .select('friend_id, users!friendships_friend_id_fkey(id, email)')
      .eq('user_id', decoded.id)

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      friends: friends || [],
    })
  } catch (error) {
    console.error('List friends error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
