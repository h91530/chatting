'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import { useAlert } from '@/context/AlertContext'

interface UserProfile {
  id: string
  email: string
  username: string
  created_at: string
  followers_count?: number
  following_count?: number
  posts_count?: number
}

interface Post {
  id: string
  title: string
  content: string
  image_url: string | null
  created_at: string
  likes_count: number
}

export default function ProfilePage() {
  const params = useParams()
  const { showAlert } = useAlert()
  const userId = params.id as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        // 프로필 정보 가져오기
        const profileRes = await fetch(`/api/users/${userId}`)
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile({
            id: profileData.id,
            email: profileData.email,
            username: profileData.username,
            created_at: profileData.created_at,
            followers_count: profileData.followers_count || 0,
            following_count: profileData.following_count || 0,
            posts_count: profileData.posts_count || 0,
          })
          setPosts(profileData.posts || [])

          // 자신의 프로필인지 확인
          const meRes = await fetch('/api/auth/me')
          if (meRes.ok) {
            const meData = await meRes.json()
            setIsOwnProfile(meData.user?.id === userId)
          }
        } else {
          showAlert('프로필을 불러올 수 없습니다', 'error')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        showAlert('오류가 발생했습니다', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchProfileAndPosts()
    }
  }, [userId, showAlert])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white text-xl font-bold mb-4 animate-pulse mx-auto">
            Y
          </div>
          <div className="text-gray-600 text-sm font-medium">프로필을 불러오는 중...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">프로필을 찾을 수 없습니다</h2>
            <p className="text-gray-600 text-sm">요청하신 사용자의 프로필이 존재하지 않습니다.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        // 언팔로우
        const response = await fetch(`/api/follows/${userId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setIsFollowing(false)
          showAlert('팔로우를 취소했습니다', 'success')
          setProfile(prev => prev ? {
            ...prev,
            followers_count: (prev.followers_count || 0) - 1
          } : null)
        }
      } else {
        // 팔로우
        const response = await fetch(`/api/follows/${userId}`, {
          method: 'POST',
        })
        if (response.ok) {
          setIsFollowing(true)
          showAlert('팔로우했습니다', 'success')
          setProfile(prev => prev ? {
            ...prev,
            followers_count: (prev.followers_count || 0) + 1
          } : null)
        }
      }
    } catch (error) {
      console.error('Follow error:', error)
      showAlert('작업 중 오류가 발생했습니다', 'error')
    }
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
      })
      if (response.ok) {
        setPosts(posts.map(post =>
          post.id === postId
            ? { ...post, likes_count: (post.likes_count || 0) + 1 }
            : post
        ))
        showAlert('좋아요를 눌렀습니다', 'success')
      }
    } catch (error) {
      console.error('Like error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl font-bold text-gray-700">
                {profile.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{profile.username}</h1>
                <p className="text-gray-500 text-sm">{profile.email}</p>
              </div>
            </div>
            
            {!isOwnProfile && (
              <button
                onClick={handleFollow}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                  isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {isFollowing ? '팔로잉' : '팔로우'}
              </button>
            )}
          </div>

          {/* 통계 정보 */}
          <div className="flex items-center gap-8 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{profile.posts_count || 0}</div>
              <div className="text-sm text-gray-500">게시글</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{profile.followers_count || 0}</div>
              <div className="text-sm text-gray-500">팔로워</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{profile.following_count || 0}</div>
              <div className="text-sm text-gray-500">팔로잉</div>
            </div>
          </div>
        </div>

        {/* 게시물 섹션 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">게시물</h2>

          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <article key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  {post.image_url && (
                    <div className="w-full h-48 overflow-hidden bg-gray-100 rounded-lg mb-4">
                      <img
                        src={post.image_url}
                        alt={post.title || 'Post'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    {post.title && (
                      <h3 className="font-semibold text-gray-900 text-lg">{post.title}</h3>
                    )}
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-sm text-gray-500">
                        {new Date(post.created_at).toLocaleDateString('ko-KR')}
                      </span>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                          ♥ {post.likes_count || 0}
                        </button>
                        <span className="text-sm text-gray-500">
                          댓글 0
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                Y
              </div>
              <h3 className="text-gray-900 text-lg font-semibold mb-2">아직 게시물이 없습니다</h3>
              <p className="text-gray-600 text-sm">첫 번째 게시물을 공유해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
