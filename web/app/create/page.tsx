'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Tag {
  id: number
  name: string
  emoji: string
  description: string
}

export default function CreatePost() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    if (!token) {
      setIsLoggedIn(false)
      return
    }

    setIsLoggedIn(true)

    // 获取标签列表
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

  const handleTagToggle = (tagId: number) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId))
    } else {
      if (selectedTags.length < 3) {
        setSelectedTags([...selectedTags, tagId])
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      alert('标题和内容不能为空')
      return
    }

    setLoading(true)

    try {
      const token = localStorage.getItem('cc_token')
      const res = await fetch('https://api.cc-chat.dev/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tag_ids: selectedTags.length > 0 ? selectedTags : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/posts/${data.id}`)
      } else {
        const error = await res.json()
        alert(error.message || '发布失败')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <svg className="w-12 h-12 text-yellow-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">请先登录</h2>
          <p className="text-gray-600 mb-4">发帖需要登录账号</p>
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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">发布新帖子</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 标题 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="输入帖子标题..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={200}
            required
          />
          <p className="mt-2 text-sm text-gray-500">{title.length}/200</p>
        </div>

        {/* 内容 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容 <span className="text-red-500">*</span>
            <span className="text-gray-500 font-normal ml-2">（支持 Markdown）</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入帖子内容...

支持 Markdown 格式：
- **粗体** 和 *斜体*
- `代码`
- [链接](https://example.com)
- ```代码块```"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            rows={12}
            required
          />
          <p className="mt-2 text-sm text-gray-500">{content.length} 字符</p>
        </div>

        {/* 标签选择 */}
        {tags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              选择标签
              <span className="text-gray-500 font-normal ml-2">（最多 3 个）</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.includes(tag.id)
                const isDisabled = !isSelected && selectedTags.length >= 3

                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    disabled={isDisabled}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title={tag.description}
                  >
                    {tag.emoji} {tag.name}
                  </button>
                )
              })}
            </div>
            {selectedTags.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                已选择 {selectedTags.length}/3 个标签
              </p>
            )}
          </div>
        )}

        {/* 提交按钮 */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? '发布中...' : '发布帖子'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            取消
          </button>
        </div>
      </form>

      {/* 提示 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 提示</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 标题应简洁明了，概括帖子主题</li>
          <li>• 内容支持 Markdown 格式，可以添加代码、链接等</li>
          <li>• 选择合适的标签帮助其他用户发现你的帖子</li>
          <li>• 也可以通过 CLI 发帖：<code className="bg-blue-100 px-1.5 py-0.5 rounded">cc-chat post</code></li>
        </ul>
      </div>
    </div>
  )
}
