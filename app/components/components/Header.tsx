import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('User check error:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router.pathname])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // 로그인 페이지나 회원가입 페이지에서는 헤더를 표시하지 않음
  if (router.pathname === '/login' || router.pathname === '/signup' || router.pathname === '/') {
    return null
  }

  if (loading) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-logo">
          <Link href="/feed">
            <span className="header-logo-icon">📸</span>
            <span className="header-logo-text">Yang</span>
          </Link>
        </div>

        <nav className="header-nav">
          <Link href="/feed">
            <button className="header-nav-item">
              🏠 HOME
            </button>
          </Link>
          <Link href="/upload">
            <button className="header-nav-item">
              ✨ UPLOAD
            </button>
          </Link>
          {user && (
            <Link href={`/profile/${user.id}`}>
              <button className="header-nav-item">
                👤 PROFILE
              </button>
            </Link>
          )}
        </nav>

        <div className="header-user">
          {user && (
            <>
              <span className="header-user-name">{user.email}</span>
              <button
                className="header-logout-btn"
                onClick={handleLogout}
              >
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
