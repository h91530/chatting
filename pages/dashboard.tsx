import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  }
}

export default function Dashboard() {
  const { user, loading } = useProtectedRoute()
  const { logout } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-blue-600">Supabase Auth</h1>
            <div className="flex gap-4">
              <Link href="/chat" className="text-blue-600 hover:text-blue-700 font-semibold">
                💬 채팅
              </Link>
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">환영합니다! 👋</h2>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-6">
            <p className="text-gray-700 mb-2">
              <span className="font-semibold">로그인된 이메일:</span> {user.email}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">사용자 ID:</span> {user.id}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Supabase 인증이 성공적으로 설정되었습니다!</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>✅ Supabase 데이터베이스에 연결됨</li>
              <li>✅ 회원가입 기능 구현 완료</li>
              <li>✅ 로그인 기능 구현 완료</li>
              <li>✅ 보호된 페이지 설정 완료</li>
              <li>✅ 자동 로그아웃 기능 구현 완료</li>
            </ul>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">다음 단계:</h4>
            <ol className="list-decimal list-inside text-gray-600 space-y-1">
              <li>사용자 프로필 페이지 만들기</li>
              <li>비밀번호 변경 기능 추가</li>
              <li>소셜 로그인 (Google, GitHub) 연동</li>
              <li>이메일 인증 추가</li>
              <li>2FA (2 Factor Authentication) 구현</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
