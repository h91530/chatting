'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { useAlert } from '@/context/AlertContext'

export default function UploadPage() {
  const router = useRouter()
  const { showAlert } = useAlert()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      showAlert('내용을 입력해주세요', 'error')
      return
    }

    setUploading(true)

    try {
      let imageUrl = null

      // 이미지 업로드
      if (image) {
        const formData = new FormData()
        formData.append('file', image)

        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadRes.ok) {
          showAlert('이미지 업로드에 실패했습니다', 'error')
          setUploading(false)
          return
        }

        const uploadData = await uploadRes.json()
        imageUrl = uploadData.url
      }

      // 게시물 생성
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title || null,
          content,
          image_url: imageUrl,
        }),
      })

      if (response.ok) {
        showAlert('게시물이 등록되었습니다', 'success')
        router.push('/feed')
      } else {
        const data = await response.json()
        showAlert(data.message || '게시물 등록에 실패했습니다', 'error')
      }
    } catch (error) {
      console.error('Upload error:', error)
      showAlert('오류가 발생했습니다', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">새 게시물 작성</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 (선택사항)
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="게시물의 제목을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="무엇을 생각하고 있으신가요?"
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">{content.length} / 1000</p>
            </div>

            {/* 이미지 업로드 */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                이미지 (선택사항)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  {preview ? (
                    <div className="space-y-2">
                      <img
                        src={preview}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <p className="text-sm text-gray-500">다른 이미지를 선택하려면 클릭하세요</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-900">이미지를 선택하세요</p>
                      <p className="text-sm text-gray-500">또는 여기에 드래그하세요</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                {uploading ? '등록 중...' : '게시물 등록'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-2 bg-gray-100 text-gray-900 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
