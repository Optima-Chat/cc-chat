import { marked } from 'marked'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Post {
  id: number
  title: string
  content: string
  created_at: string
  author: {
    username: string
  }
}

async function getPost(id: string): Promise<Post | null> {
  try {
    const res = await fetch(`https://api.cc-chat.dev/api/posts/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    return null
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-block text-gray-600 hover:text-gray-900 mb-6"
      >
        ← 返回首页
      </Link>

      <article className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center text-sm text-gray-500 mb-8 pb-6 border-b">
          <span className="font-medium">{post.author?.username || '未知用户'}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: marked(post.content)
          }}
        />
      </article>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">评论</h3>
        <div className="text-gray-500 text-center py-8">
          评论功能开发中...
        </div>
      </div>
    </div>
  )
}
