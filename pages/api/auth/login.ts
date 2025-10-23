import type { NextApiRequest, NextApiResponse } from 'next'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-insecure'

type ResponseData = {
  success: boolean
  message?: string
  token?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  const { email, password } = req.body

  // 입력값 검증
  if (!email || !password) {
    return res.status(400).json({ success: false, message: '이메일과 비밀번호를 입력하세요' })
  }

  try {
    // 사용자 조회
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('email', email)
      .single()

    if (error || !user) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다' })
    }

    // 비밀번호 검증
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다' })
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 쿠키에 토큰 저장
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Max-Age=604800`)

    return res.status(200).json({
      success: true,
      message: '로그인 성공',
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ success: false, message: '서버 오류 발생' })
  }
}
