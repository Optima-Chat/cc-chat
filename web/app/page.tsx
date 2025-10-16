'use client'

import { marked } from 'marked'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import VoteButtons from './components/VoteButtons'
import PostSkeleton from './components/PostSkeleton'

interface Post {
  id: number
  title: string
  content: string
  upvotes: number
  downvotes: number
  comment_count: number
  created_at: string
  author: {
    username: string
  }
  tags: Array<{
    id: number
    name: string
    emoji: string
  }>
  user_vote: number | null
}

function formatDate(dateString: string): string {
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

interface Tag {
  id: number
  name: string
  emoji: string
  description: string
}

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [sort, setSort] = useState<string>('hot')
  const [selectedTag, setSelectedTag] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch('https://api.cc-chat.dev/api/tags')
        if (res.ok) {
          const data = await res.json()
          setTags(data)
        }
      } catch (error) {
        console.error('Failed to fetch tags:', error)
      }
    }

    fetchTags()
  }, [])

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      const headers: Record<string, string> = {}
      const token = localStorage.getItem('cc_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const params = new URLSearchParams({
        limit: '20',
        sort,
      })

      if (selectedTag) {
        params.append('tag', selectedTag.toString())
      }

      const res = await fetch(`https://api.cc-chat.dev/api/posts?${params}`, {
        cache: 'no-store',
        headers,
      })

      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
      setLoading(false)
    }

    fetchPosts()
  }, [sort, selectedTag])

  const sortOptions = [
    {
      value: 'hot',
      label: '热门',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      value: 'new',
      label: '最新',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      value: 'top',
      label: '最高分',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      value: 'comments',
      label: '最多讨论',
      icon: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      )
    },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Claude Code 用户的中文聊天社区
        </h2>
        <p className="text-gray-600 mb-6">
          直接在终端发帖交流 • 零配置 • 自然语言操作
        </p>
        <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-left text-sm font-mono mb-6">
          <div className="text-gray-400"># 安装</div>
          <div className="text-green-400">npm install -g @optima-chat/cc-chat@latest</div>
          <div className="mt-2 text-gray-400"># 然后对 Claude 说：</div>
          <div className="text-blue-400">"帮我登录 CC Chat，用户名是 yourname"</div>
          <div className="text-blue-400">"帮我发个帖子分享我的 MCP 配置"</div>
        </div>
        <a
          href="https://github.com/Optima-Chat/cc-chat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition"
        >
          查看文档 →
        </a>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">帖子列表</h3>
          <div className="flex gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSort(option.value)}
                className={`px-3 py-1.5 rounded text-sm flex items-center gap-1.5 ${
                  sort === option.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 标签筛选 */}
        {tags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                  selectedTag === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => setSelectedTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    selectedTag === tag.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.emoji} {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {loading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            暂无帖子
          </div>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block">
              <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex">
                {/* 投票区域 */}
                <VoteButtons
                  postId={post.id}
                  initialScore={post.upvotes - post.downvotes}
                  initialUserVote={post.user_vote as (1 | -1 | 0) || 0}
                />

                {/* 内容区域 */}
                <div className="flex-1 p-6">
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

                  <h4 className="text-xl font-semibold text-gray-900 mb-2">
                    {post.title}
                  </h4>
                  <div className="text-sm text-gray-500 mb-4">
                    {post.author?.username || '未知用户'} • {formatDate(post.created_at)} • {post.comment_count} 评论
                  </div>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: marked(post.content.substring(0, 300) + (post.content.length > 300 ? '...' : ''))
                    }}
                  />
                </div>
              </article>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
