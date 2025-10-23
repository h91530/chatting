import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-insecure'

type ResponseData = {
  success: boolean
  user?: {
    id: string
    email: string
  }
  message?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // 쿠키에서 토큰 추출
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ success: false, message: '인증되지 않음' })
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string }

    // 사용자 정보 조회 (DB에서 최신 정보 확인)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('id', decoded.id)
      .single()

    if (error || !user) {
      return res.status(401).json({ success: false, message: '사용자를 찾을 수 없습니다' })
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Me error:', error)
    return res.status(401).json({ success: false, message: '인증 실패' })
  }
}
