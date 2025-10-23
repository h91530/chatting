import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'
import { useAuth } from '@/hooks/useAuth'

interface Conversation {
  id: string
  user1_id: string
  user2_id: string
  created_at: string
}

interface Friend {
  friend_id: string
  users: {
    id: string
    email: string
  }
}

export default function ChatPage() {
  const { user, loading } = useProtectedRoute()
  const { logout } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [pageTab, setPageTab] = useState<'chats' | 'friends'>('chats')
  const [conversationLoading, setConversationLoading] = useState(true)

  // 대화 목록 로드
  useEffect(() => {
    if (!user) return

    const loadConversations = async () => {
      try {
        const response = await fetch('/api/conversations/get')
        const data = await response.json()
        if (data.success) {
          setConversations(data.conversations)
        }
      } catch (error) {
        console.error('Load conversations error:', error)
      } finally {
        setConversationLoading(false)
      }
    }

    loadConversations()
  }, [user])

  // 친구 목록 로드
  useEffect(() => {
    if (!user) return

    const loadFriends = async () => {
      try {
        const response = await fetch('/api/friends/list')
        const data = await response.json()
        if (data.success) {
          setFriends(data.friends)
        }
      } catch (error) {
        console.error('Load friends error:', error)
      }
    }

    loadFriends()
  }, [user])

  // 사용자 검색
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (data.success) {
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
  }

  // 친구 추가
  const handleAddFriend = async (friendId: string) => {
    try {
      const response = await fetch('/api/friends/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      })
      const data = await response.json()
      if (data.success) {
        alert('친구 추가 완료!')
        setSearchQuery('')
        setSearchResults([])
        // 친구 목록 새로고침
        const listResponse = await fetch('/api/friends/list')
        const listData = await listResponse.json()
        if (listData.success) {
          setFriends(listData.friends)
        }
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Add friend error:', error)
      alert('친구 추가 실패')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 네비게이션 */}
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Chat App</h1>
          <div className="flex gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              로그아웃
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4">
        {/* 탭 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setPageTab('chats')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              pageTab === 'chats'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            채팅 목록
          </button>
          <button
            onClick={() => setPageTab('friends')}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              pageTab === 'friends'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            친구 찾기
          </button>
        </div>

        {pageTab === 'chats' ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">채팅 목록</h2>
            {conversationLoading ? (
              <p className="text-gray-600">로딩 중...</p>
            ) : conversations.length === 0 ? (
              <p className="text-gray-600">채팅이 없습니다. 친구를 추가하세요!</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => {
                  const otherUserId = conv.user1_id === user?.id ? conv.user2_id : conv.user1_id
                  const friend = friends.find((f) => f.friend_id === otherUserId)

                  return (
                    <Link
                      key={conv.id}
                      href={`/chat/${conv.id}`}
                      className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                    >
                      <p className="font-semibold text-gray-800">
                        {friend?.users.email || '사용자'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">친구 찾기</h2>
            <input
              type="text"
              placeholder="이메일로 검색..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="font-semibold">{user.email}</p>
                  <button
                    onClick={() => handleAddFriend(user.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    친구 추가
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
