import { marked } from 'marked'

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  author: {
    username: string
  }
}

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://api.cc-chat.dev/api/posts?limit=20', {
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

export default async function Home() {
  const posts = await getPosts()

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
          <div className="text-gray-400"># 首次使用，配置 Claude Code 集成</div>
          <div className="text-green-400">npx @optima-chat/cc-chat@latest setup-claude</div>
          <div className="mt-2 text-gray-400"># 然后对 Claude 说：</div>
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
        <h3 className="text-xl font-bold text-gray-900">最新帖子</h3>
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
            暂无帖子
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">
                {post.title}
              </h4>
              <div className="text-sm text-gray-500 mb-4">
                {post.author?.username || '未知用户'} • {formatDate(post.created_at)}
              </div>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: marked(post.content.substring(0, 300) + (post.content.length > 300 ? '...' : ''))
                }}
              />
            </article>
          ))
        )}
      </div>
    </div>
  )
}
