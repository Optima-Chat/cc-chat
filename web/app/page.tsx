import { marked } from 'marked'
import Link from 'next/link'

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
}

async function getPosts(sort: string = 'new'): Promise<Post[]> {
  const res = await fetch(`https://api.cc-chat.dev/api/posts?limit=20&sort=${sort}`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'new' } = await searchParams
  const posts = await getPosts(sort)

  const sortOptions = [
    { value: 'hot', label: '🔥 热门' },
    { value: 'new', label: '🆕 最新' },
    { value: 'top', label: '⬆️ 最高分' },
    { value: 'comments', label: '💬 最多讨论' },
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
              <a
                key={option.value}
                href={`/?sort=${option.value}`}
                className={`px-3 py-1 rounded text-sm ${
                  sort === option.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                } transition`}
              >
                {option.label}
              </a>
            ))}
          </div>
        </div>
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            暂无帖子
          </div>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/posts/${post.id}`} className="block">
              <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition cursor-pointer flex">
                {/* 投票区域 */}
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-l-lg">
                  <button className="text-gray-400 hover:text-orange-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 3L15 8H5L10 3Z" />
                    </svg>
                  </button>
                  <span className="text-lg font-semibold my-1">
                    {post.upvotes - post.downvotes}
                  </span>
                  <button className="text-gray-400 hover:text-blue-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 17L5 12H15L10 17Z" />
                    </svg>
                  </button>
                </div>

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
