'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import MarkdownContent from '../../components/MarkdownContent'

interface User {
  id: number
  username: string
  avatar_url: string | null
  created_at: string
  stats: {
    post_count: number
    comment_count: number
    total_votes: number
  }
}

interface Post {
  id: number
  title: string
  content: string
  upvotes: number
  downvotes: number
  comment_count: number
  created_at: string
  author: {
    id: number
    username: string
    avatar_url: string | null
  }
  tags: Array<{
    id: number
    name: string
    emoji: string
  }>
}

interface Comment {
  id: number
  content: string
  upvotes: number
  downvotes: number
  parent_id: number | null
  created_at: string
  post_id: number
  post_title: string
  author: {
    id: number
    username: string
    avatar_url: string | null
  }
}

export default function UserProfile() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 获取用户信息
        const userRes = await fetch(`https://api.cc-chat.dev/api/users/${params.username}`)
        if (userRes.ok) {
          const userData = await userRes.json()
          setUser(userData)
        }

        // 获取用户帖子
        const postsRes = await fetch(`https://api.cc-chat.dev/api/users/${params.username}/posts`)
        if (postsRes.ok) {
          const postsData = await postsRes.json()
          setPosts(postsData)
        }

        // 获取用户评论
        const commentsRes = await fetch(`https://api.cc-chat.dev/api/users/${params.username}/comments`)
        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          setComments(commentsData)
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.username) {
      fetchUserData()
    }
  }, [params.username])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatPostDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `${minutes} 分钟前`
      }
      return `${hours} 小时前`
    }

    if (days < 7) {
      return `${days} 天前`
    }

    return date.toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="h-16 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600">用户不存在</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 用户信息卡片 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h1>
            <p className="text-sm text-gray-500 mb-4">加入于 {formatDate(user.created_at)}</p>

            {/* 统计数据 */}
            <div className="flex gap-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.stats.post_count}</div>
                <div className="text-sm text-gray-500">帖子</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.stats.comment_count}</div>
                <div className="text-sm text-gray-500">评论</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{user.stats.total_votes}</div>
                <div className="text-sm text-gray-500">获得投票</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab 切换 */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'posts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            帖子 ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            评论 ({comments.length})
          </button>
        </nav>
      </div>

      {/* 帖子列表 */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              该用户还没有发布帖子
            </div>
          ) : (
            posts.map((post) => (
              <Link key={post.id} href={`/posts/${post.id}`}>
                <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 cursor-pointer">
                  {/* 标签 */}
                  {post.tags.length > 0 && (
                    <div className="flex gap-2 mb-2">
                      {post.tags.map((tag) => (
                        <span key={tag.id} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {tag.emoji} {tag.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{post.title}</h3>

                  <div className="text-sm text-gray-500 mb-4">
                    {formatPostDate(post.created_at)} • {post.comment_count} 评论 • {post.upvotes - post.downvotes} 分
                  </div>

                  <div className="line-clamp-3 text-gray-700">
                    <MarkdownContent content={post.content} className="prose-sm" />
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      )}

      {/* 评论列表 */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
              该用户还没有发表评论
            </div>
          ) : (
            comments.map((comment) => (
              <Link key={comment.id} href={`/posts/${comment.post_id}`}>
                <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-6 cursor-pointer">
                  <div className="mb-3">
                    <span className="text-sm text-gray-500">评论于：</span>
                    <span className="text-sm font-medium text-blue-600 ml-1">{comment.post_title}</span>
                  </div>

                  <div className="text-gray-700 mb-3">
                    <MarkdownContent content={comment.content} className="prose-sm" />
                  </div>

                  <div className="text-sm text-gray-500">
                    {formatPostDate(comment.created_at)} • {comment.upvotes - comment.downvotes} 分
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
