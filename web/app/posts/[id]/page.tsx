'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  downvotes: number
  parent_id: number | null
  author: {
    id: number
    username: string
    avatar_url: string | null
  }
  created_at: string
  user_vote?: number
  replies: Comment[]
}

interface CommentItemProps {
  comment: Comment
  depth: number
  isLoggedIn: boolean
  collapsedComments: Set<number>
  replyingTo: number | null
  replyText: string
  submitting: boolean
  setCollapsedComments: React.Dispatch<React.SetStateAction<Set<number>>>
  setReplyingTo: React.Dispatch<React.SetStateAction<number | null>>
  setReplyText: React.Dispatch<React.SetStateAction<string>>
  handleCommentVote: (commentId: number, value: 1 | -1) => void
  handleReply: (e: React.FormEvent, parentId: number) => void
  formatDate: (dateString: string) => string
}

function CommentItem({
  comment,
  depth,
  isLoggedIn,
  collapsedComments,
  replyingTo,
  replyText,
  submitting,
  setCollapsedComments,
  setReplyingTo,
  setReplyText,
  handleCommentVote,
  handleReply,
  formatDate,
}: CommentItemProps) {
  const score = comment.upvotes - comment.downvotes
  const isCollapsed = collapsedComments.has(comment.id)
  const maxDepth = 4 // 最大嵌套层数

  return (
    <div className={`${depth > 0 ? 'ml-4 sm:ml-8 border-l-2 border-gray-300 pl-3 sm:pl-4' : ''} py-2`}>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
        <Link
          href={`/users/${comment.author.username}`}
          className="text-sm sm:text-base font-medium text-gray-900 hover:text-blue-600 transition"
        >
          {comment.author.username}
        </Link>
        <span className="text-xs sm:text-sm text-gray-500">{formatDate(comment.created_at)}</span>
        {score < -5 && (
          <span className="text-xs text-gray-400">评分过低</span>
        )}
      </div>

      {isCollapsed ? (
        <button
          onClick={() => setCollapsedComments(prev => {
            const next = new Set(prev)
            next.delete(comment.id)
            return next
          })}
          className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
        >
          [点击展开评论]
        </button>
      ) : (
        <>
          <div className="text-sm sm:text-base text-gray-700 mb-2">
            <MarkdownContent content={comment.content} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Upvote */}
            <button
              onClick={() => handleCommentVote(comment.id, 1)}
              className={`flex items-center gap-1 text-xs sm:text-sm transition ${
                comment.user_vote === 1
                  ? 'text-orange-500'
                  : 'text-gray-500 hover:text-orange-500'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </button>

            {/* Score */}
            <span className={`text-xs sm:text-sm font-medium ${
              score > 0 ? 'text-orange-500' : score < 0 ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {score}
            </span>

            {/* Downvote */}
            <button
              onClick={() => handleCommentVote(comment.id, -1)}
              className={`flex items-center gap-1 text-xs sm:text-sm transition ${
                comment.user_vote === -1
                  ? 'text-blue-500'
                  : 'text-gray-500 hover:text-blue-500'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" transform="rotate(180)">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </button>

            {/* Reply button */}
            {depth < maxDepth && (
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    alert('请先登录')
                    return
                  }
                  setReplyingTo(comment.id)
                  setReplyText('')
                }}
                className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 ml-2"
              >
                回复
              </button>
            )}

            {score < -5 && (
              <button
                onClick={() => setCollapsedComments(prev => {
                  const next = new Set(prev)
                  next.add(comment.id)
                  return next
                })}
                className="text-xs text-gray-400 hover:text-gray-600 ml-2"
              >
                [折叠]
              </button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleReply(e, comment.id)} className="mt-3">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="写下你的回复..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                disabled={submitting}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(null)
                    setReplyText('')
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={submitting || !replyText.trim()}
                  className="px-4 py-1 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '提交中...' : '回复'}
                </button>
              </div>
            </form>
          )}

          {/* Render replies recursively */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  isLoggedIn={isLoggedIn}
                  collapsedComments={collapsedComments}
                  replyingTo={replyingTo}
                  replyText={replyText}
                  submitting={submitting}
                  setCollapsedComments={setCollapsedComments}
                  setReplyingTo={setReplyingTo}
                  setReplyText={setReplyText}
                  handleCommentVote={handleCommentVote}
                  handleReply={handleReply}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
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
  const [collapsedComments, setCollapsedComments] = useState<Set<number>>(new Set())
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState('')

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

          // Auto-collapse negative comments
          const negativeCommentIds = commentsData
            .filter((c: Comment) => (c.upvotes - c.downvotes) < -5)
            .map((c: Comment) => c.id)
          setCollapsedComments(new Set(negativeCommentIds))
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

  const handleReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault()

    if (!isLoggedIn) {
      alert('请先登录')
      return
    }

    if (!replyText.trim()) {
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
        body: JSON.stringify({ text: replyText.trim(), parent_id: parentId }),
      })

      if (res.ok) {
        const newComment = await res.json()

        // 递归更新评论树
        const updateCommentTree = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: [...comment.replies, newComment]
              }
            } else if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentTree(comment.replies)
              }
            }
            return comment
          })
        }

        setComments(updateCommentTree(comments))
        setReplyText('')
        setReplyingTo(null)

        // 更新帖子的评论数
        if (post) {
          setPost({
            ...post,
            comment_count: post.comment_count + 1,
          })
        }
      } else {
        alert('回复失败，请重试')
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
      alert('回复失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCommentVote = async (commentId: number, value: 1 | -1) => {
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
        body: JSON.stringify({ value }),
      })

      if (res.ok) {
        const result = await res.json()
        const isCancel = result.message.includes('取消')
        const isUpdate = result.message.includes('更新')

        // 递归更新评论投票状态
        const updateCommentVotes = (comments: Comment[]): Comment[] => {
          return comments.map(comment => {
            if (comment.id === commentId) {
              const currentVote = comment.user_vote || 0
              let newUpvotes = comment.upvotes
              let newDownvotes = comment.downvotes
              let newUserVote = currentVote

              if (isCancel) {
                if (currentVote === 1) {
                  newUpvotes -= 1
                } else if (currentVote === -1) {
                  newDownvotes -= 1
                }
                newUserVote = 0
              } else if (isUpdate) {
                if (currentVote === 1 && value === -1) {
                  newUpvotes -= 1
                  newDownvotes += 1
                } else if (currentVote === -1 && value === 1) {
                  newUpvotes += 1
                  newDownvotes -= 1
                }
                newUserVote = value
              } else {
                if (value === 1) {
                  newUpvotes += 1
                } else {
                  newDownvotes += 1
                }
                newUserVote = value
              }

              return {
                ...comment,
                upvotes: newUpvotes,
                downvotes: newDownvotes,
                user_vote: newUserVote,
                replies: comment.replies.length > 0 ? updateCommentVotes(comment.replies) : []
              }
            } else if (comment.replies.length > 0) {
              return {
                ...comment,
                replies: updateCommentVotes(comment.replies)
              }
            }
            return comment
          })
        }

        setComments(updateCommentVotes(comments))
      } else {
        const errorData = await res.json().catch(() => ({ message: '未知错误' }))
        console.error('Vote failed:', res.status, errorData)
        alert(`投票失败: ${errorData.message || '请重试'}`)
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
                <Link
                  href={`/users/${post.author.username}`}
                  className="font-medium text-gray-700 hover:text-blue-600 transition"
                >
                  {post.author.username}
                </Link>
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
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      depth={0}
                      isLoggedIn={isLoggedIn}
                      collapsedComments={collapsedComments}
                      replyingTo={replyingTo}
                      replyText={replyText}
                      submitting={submitting}
                      setCollapsedComments={setCollapsedComments}
                      setReplyingTo={setReplyingTo}
                      setReplyText={setReplyText}
                      handleCommentVote={handleCommentVote}
                      handleReply={handleReply}
                      formatDate={formatDate}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
    </div>
  )
}
