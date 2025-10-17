'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import VoteButtons from '../../components/VoteButtons'
import GithubLoginButton from '../../components/GithubLoginButton'
import MarkdownContent from '../../components/MarkdownContent'

interface Post {
  id: number
  title: string
  content: string
  author: {
    id: number
    username: string
    avatar_url: string | null
  }
  created_at: string
  upvotes: number
  downvotes: number
  score: number
  comment_count: number
  user_vote: 1 | -1 | 0 | null
  tags?: Array<{ id: number; name: string; emoji: string }>
}

interface Comment {
  id: number
  content: string
  upvotes: number
  author: {
    id: number
    username: string
    avatar_url: string | null
  }
  created_at: string
}

export default function PostDetail() {
  const params = useParams()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    setIsLoggedIn(!!token)
  }, [])

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      const headers: Record<string, string> = {}
      const token = localStorage.getItem('cc_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      try {
        // 获取帖子详情
        const postRes = await fetch(`https://api.cc-chat.dev/api/posts/${params.id}`, {
          headers,
        })

        if (postRes.ok) {
          const postData = await postRes.json()
          setPost(postData)
        } else {
          router.push('/')
          return
        }

        // 获取评论列表
        const commentsRes = await fetch(`https://api.cc-chat.dev/api/posts/${params.id}/comments`, {
          headers,
        })

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json()
          setComments(commentsData)
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchPost()
    }
  }, [params.id, router])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isLoggedIn) {
      alert('请先登录')
      return
    }

    if (!commentText.trim()) {
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('cc_token')
      const res = await fetch(`https://api.cc-chat.dev/api/posts/${params.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: commentText.trim() }),
      })

      if (res.ok) {
        const newComment = await res.json()
        setComments([...comments, newComment])
        setCommentText('')

        // 更新帖子的评论数
        if (post) {
          setPost({
            ...post,
            comment_count: post.comment_count + 1,
          })
        }
      } else {
        alert('评论失败，请重试')
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert('评论失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentVote = async (commentId: number) => {
    if (!isLoggedIn) {
      alert('请先登录')
      return
    }

    try {
      const token = localStorage.getItem('cc_token')
      const res = await fetch(`https://api.cc-chat.dev/api/posts/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ value: 1 }),
      })

      if (res.ok) {
        const result = await res.json()
        const isCancel = result.message.includes('取消')

        // 更新评论点赞数
        setComments(comments.map(comment =>
          comment.id === commentId
            ? { ...comment, upvotes: comment.upvotes + (isCancel ? -1 : 1) }
            : comment
        ))
      } else {
        alert('投票失败，请重试')
      }
    } catch (error) {
      console.error('Failed to vote comment:', error)
      alert('投票失败，请重试')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '刚刚'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分钟前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小时前`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} 天前`

    return date.toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex">
            {/* 投票区域 */}
            <div className="p-2 sm:p-4 bg-gray-50 rounded-l-lg">
              <VoteButtons
                postId={post.id}
                initialScore={post.upvotes - post.downvotes}
                initialUserVote={post.user_vote || 0}
              />
            </div>

            {/* 主内容区域 */}
            <div className="flex-1 p-4 sm:p-6">
              {/* 标签 */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-1.5 sm:gap-2 mb-3 flex-wrap">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded"
                    >
                      {tag.emoji} {tag.name}
                    </span>
                  ))}
                </div>
              )}

              {/* 标题 */}
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>

              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <span className="font-medium text-gray-700">{post.author.username}</span>
                <span>•</span>
                <span>{formatDate(post.created_at)}</span>
                <span>•</span>
                <span>{post.comment_count} 条评论</span>
              </div>

              {/* 内容 */}
              <div className="text-gray-700 mb-6 sm:mb-8">
                <MarkdownContent content={post.content} />
              </div>

              {/* 评论区分隔线 */}
              <div className="border-t border-gray-200 my-4 sm:my-6"></div>

              {/* 评论输入框 */}
              {isLoggedIn ? (
                <form onSubmit={handleSubmitComment} className="mb-6 sm:mb-8">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="写下你的评论..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={submitting}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={submitting || !commentText.trim()}
                      className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? '提交中...' : '发表评论'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-3">登录后即可发表评论</p>
                  <GithubLoginButton />
                </div>
              )}

              {/* 评论列表 */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                  评论 ({comments.length})
                </h2>

                {comments.length === 0 ? (
                  <p className="text-sm sm:text-base text-gray-500 text-center py-6 sm:py-8">暂无评论，来发表第一条评论吧！</p>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-gray-200 pl-3 sm:pl-4 py-2">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <span className="text-sm sm:text-base font-medium text-gray-900">{comment.author.username}</span>
                        <span className="text-xs sm:text-sm text-gray-500">{formatDate(comment.created_at)}</span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap mb-2">{comment.content}</p>
                      <button
                        onClick={() => handleCommentVote(comment.id)}
                        className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-orange-500 transition"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                        </svg>
                        <span>{comment.upvotes || 0}</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
    </div>
  )
}
