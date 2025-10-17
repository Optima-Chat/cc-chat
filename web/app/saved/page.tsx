'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Post {
  id: number
  title: string
  content: string
  username: string
  upvotes: number
  downvotes: number
  comments_count: number
  bookmarked_at: string
  created_at: string
}

export default function SavedPosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSavedPosts = async () => {
      const token = localStorage.getItem('cc_token')

      if (!token) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)

      try {
        const res = await fetch('https://api.cc-chat.dev/api/bookmarks?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (res.ok) {
          const data = await res.json()
          setPosts(data)
        } else if (res.status === 401) {
          localStorage.removeItem('cc_token')
          setIsLoggedIn(false)
        }
      } catch (error) {
        console.error('Failed to fetch saved posts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedPosts()
  }, [])

  const handleUnsave = async (postId: number) => {
    const token = localStorage.getItem('cc_token')

    try {
      const res = await fetch(`https://api.cc-chat.dev/api/bookmarks/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        setPosts(posts.filter(post => post.id !== postId))
      }
    } catch (error) {
      console.error('Failed to unsave post:', error)
      alert('操作失败，请重试')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">查看收藏列表需要登录账号</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            返回首页
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">我的收藏</h1>
        <span className="text-sm text-gray-500">{posts.length} 篇帖子</span>
      </div>

      {posts.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有收藏</h3>
          <p className="text-gray-500 mb-4">浏览帖子时点击收藏按钮，可以将喜欢的内容保存在这里</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            去浏览帖子
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const score = post.upvotes - post.downvotes

            return (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <h2
                    className="text-lg sm:text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer flex-1"
                    onClick={() => router.push(`/posts/${post.id}`)}
                  >
                    {post.title}
                  </h2>
                  <button
                    onClick={() => handleUnsave(post.id)}
                    className="self-start bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg hover:bg-yellow-200 transition text-sm font-medium flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    已收藏
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {post.username}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {post.comments_count} 条评论
                  </span>
                  <span className={`flex items-center gap-1 ${score > 0 ? 'text-green-600' : score < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    {score}
                  </span>
                </div>

                <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                  {post.content}
                </p>

                <div className="text-xs text-gray-400">
                  收藏于 {new Date(post.bookmarked_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
