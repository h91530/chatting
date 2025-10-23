import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  success: boolean
  message?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  // 쿠키에서 토큰 제거
  res.setHeader('Set-Cookie', 'token=; Path=/; HttpOnly; Max-Age=0')

  return res.status(200).json({
    success: true,
    message: '로그아웃 성공',
  })
}
