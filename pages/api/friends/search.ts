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
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ success: false, message: '검색어를 입력하세요' })
    }

    // 사용자 검색 (자신 제외)
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email')
      .ilike('email', `%${q}%`)
      .neq('id', decoded.id)
      .limit(10)

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    return res.status(200).json({
      success: true,
      users: users || [],
    })
  } catch (error) {
    console.error('Search error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
