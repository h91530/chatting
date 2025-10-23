import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import type { GetServerSideProps } from 'next'
import { useProtectedRoute } from '@/hooks/useProtectedRoute'

interface Message {
  id: string
  sender_id: string
  content: string
  created_at: string
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  }
}

export default function ChatDetailPage() {
  const router = useRouter()
  const { id: conversationId } = router.query
  const { user, loading } = useProtectedRoute()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [otherUserEmail, setOtherUserEmail] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지 로드 및 폴링
  useEffect(() => {
    if (!conversationId || !user) return

    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/messages/list?conversationId=${conversationId}`)
        const data = await response.json()
        if (data.success) {
          setMessages(data.messages)
        }
      } catch (error) {
        console.error('Load messages error:', error)
      }
    }

    // 초기 메시지 로드
    loadMessages()

    // 2초마다 메시지 새로고침 (폴링)
    const pollInterval = setInterval(loadMessages, 2000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [conversationId, user])

  // 상대방 이메일 로드
  useEffect(() => {
    if (!conversationId || !user) return

    const loadConversation = async () => {
      try {
        const response = await fetch('/api/conversations/get')
        const data = await response.json()
        if (data.success) {
          const conv = data.conversations.find((c: any) => c.id === conversationId)
          if (conv) {
            const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id

            // 상대방 정보 조회
            const friendResponse = await fetch('/api/friends/list')
            const friendData = await friendResponse.json()
            if (friendData.success) {
              const friend = friendData.friends.find(
                (f: any) => f.friend_id === otherUserId
              )
              if (friend) {
                setOtherUserEmail(friend.users.email)
              }
            }
          }
        }
      } catch (error) {
        console.error('Load conversation error:', error)
      }
    }

    loadConversation()
  }, [conversationId, user])

  // 메시지 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setNewMessage('')
      } else {
        alert(data.message)
      }
    } catch (error) {
      console.error('Send message error:', error)
      alert('메시지 전송 실패')
    } finally {
      setSending(false)
    }
  }

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">로딩 중...</div>
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* 헤더 */}
      <div className="bg-white shadow-md p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/chat" className="text-blue-600 hover:underline">
              ← 돌아가기
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">{otherUserEmail || '채팅'}</h1>
          </div>
          <span className="text-gray-600">{user?.email}</span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500 text-center">아직 메시지가 없습니다.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === user?.id
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-300 text-gray-800 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-600'
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="bg-white border-t border-gray-300 p-4">
        <form onSubmit={handleSendMessage} className="max-w-7xl mx-auto flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            {sending ? '전송 중...' : '전송'}
          </button>
        </form>
      </div>
    </div>
  )
}
