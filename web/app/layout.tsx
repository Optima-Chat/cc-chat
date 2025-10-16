import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CC Chat - Claude Code 用户的中文聊天社区',
  description: '直接在终端发帖交流 Claude Code 使用技巧',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                CC Chat
              </h1>
              <a
                href="https://github.com/Optima-Chat/cc-chat"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                GitHub
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-4xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
