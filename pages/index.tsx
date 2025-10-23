import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('User check error:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* 네비게이션 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Supabase Auth</h1>
            <div className="flex gap-4">
              {loading ? (
                <span className="text-gray-600">로딩 중...</span>
              ) : user ? (
                <>
                  <span className="text-gray-600">{user.email}</span>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    대시보드
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    로그인
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 섹션 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Next.js와 Supabase로 만든 <span className="text-blue-600">인증 시스템</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            안전하고 간단한 회원가입 및 로그인 기능을 경험해보세요.
          </p>
          {!user && (
            <div className="flex justify-center gap-4">
              <Link
                href="/signup"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 text-lg"
              >
                지금 시작하기
              </Link>
              <Link
                href="/login"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-lg transition duration-200 text-lg"
              >
                로그인
              </Link>
            </div>
          )}
        </div>

        {/* 기능 카드 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              title: '안전한 인증',
              description: 'bcrypt를 이용한 안전한 비밀번호 관리',
              icon: '🔒',
            },
            {
              title: '간단한 회원가입',
              description: '이메일과 비밀번호만으로 쉽게 계정을 생성할 수 있습니다',
              icon: '✍️',
            },
            {
              title: '보호된 페이지',
              description: '로그인한 사용자만 접근할 수 있는 대시보드 페이지',
              icon: '🛡️',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition duration-300"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* 기술 스택 */}
        <div className="bg-white rounded-lg shadow-lg p-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-8">사용된 기술</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">프론트엔드</h4>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Next.js 16</li>
                <li>✓ React 19</li>
                <li>✓ TypeScript</li>
                <li>✓ Tailwind CSS</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-4">백엔드 & 데이터베이스</h4>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Next.js API Routes</li>
                <li>✓ Supabase PostgreSQL</li>
                <li>✓ JWT 인증</li>
                <li>✓ bcrypt 해싱</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
