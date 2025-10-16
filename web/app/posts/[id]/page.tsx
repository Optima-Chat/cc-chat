import { marked } from 'marked'
import { notFound } from 'next/navigation'
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

interface Comment {
  id: number
  content: string
  upvotes: number
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

async function getComments(id: string): Promise<Comment[]> {
  try {
    const res = await fetch(`https://api.cc-chat.dev/api/posts/${id}/comments`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    return res.json()
  } catch (error) {
    return []
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
  const [post, comments] = await Promise.all([
    getPost(id),
    getComments(id)
  ])

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
        {/* 标签 */}
        {post.tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag.id} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-600">
                {tag.emoji} {tag.name}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>

        <div className="flex items-center text-sm text-gray-500 mb-8 pb-6 border-b">
          <span className="font-medium">{post.author?.username || '未知用户'}</span>
          <span className="mx-2">•</span>
          <span>{formatDate(post.created_at)}</span>
          <span className="mx-2">•</span>
          <span>{post.upvotes - post.downvotes} 分</span>
          <span className="mx-2">•</span>
          <span>{post.comment_count} 评论</span>
        </div>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: marked(post.content)
          }}
        />
      </article>

      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          评论 ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            还没有评论，来发表第一个评论吧！
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-4 last:border-0">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.author?.username || '未知用户'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                      {comment.upvotes > 0 && (
                        <span className="text-sm text-gray-500">
                          • {comment.upvotes} 赞
                        </span>
                      )}
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: marked(comment.content)
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
