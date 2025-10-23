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

  const { email, password, confirmPassword } = req.body

  // 입력값 검증
  if (!email || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: '모든 필드를 입력하세요' })
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다' })
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '비밀번호는 6자 이상이어야 합니다' })
  }

  try {
    // 이메일 중복 확인
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(409).json({ success: false, message: '이미 등록된 이메일입니다' })
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10)

    // 사용자 생성
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password_hash: hashedPassword,
        },
      ])
      .select('id, email, created_at')
      .single()

    if (error || !newUser) {
      return res.status(500).json({ success: false, message: '회원가입 실패' })
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // 쿠키에 토큰 저장
    res.setHeader('Set-Cookie', `token=${token}; Path=/; HttpOnly; Max-Age=604800`)

    return res.status(201).json({
      success: true,
      message: '회원가입 성공',
      token,
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ success: false, message: '서버 오류 발생' })
  }
}
