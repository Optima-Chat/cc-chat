import type { Metadata } from 'next'
import './globals.css'
import Header from './components/Header'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.cc-chat.dev'),
  title: {
    default: 'CC Chat - Claude Code 用户的中文聊天社区',
    template: '%s | CC Chat',
  },
  description: '让 Claude 帮你发帖交流，无需离开终端。支持自然语言 CLI、Reddit 内容自动同步、投票评论、收藏通知等功能。Claude Code 中文社区，MCP 配置分享，使用技巧交流。',
  keywords: ['Claude Code', 'Claude Code 中文社区', 'Claude Code 教程', 'MCP', 'MCP 插件', 'Model Context Protocol', 'Claude', 'AI 编程', '编程助手', 'CLI 工具', 'Anthropic'],
  authors: [{ name: 'CC Chat Community' }],
  creator: 'CC Chat',
  publisher: 'CC Chat',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.cc-chat.dev',
    siteName: 'CC Chat',
    title: 'CC Chat - Claude Code 用户的中文聊天社区',
    description: '让 Claude 帮你发帖交流，无需离开终端。支持自然语言 CLI、Reddit 内容自动同步、投票评论、收藏通知等功能。',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CC Chat - Claude Code 用户的中文聊天社区',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CC Chat - Claude Code 用户的中文聊天社区',
    description: '让 Claude 帮你发帖交流，无需离开终端',
    images: ['/og-image.png'],
    creator: '@cchat_dev',
  },
  alternates: {
    canonical: 'https://www.cc-chat.dev',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'CC Chat',
    alternateName: 'Claude Code 中文社区',
    url: 'https://www.cc-chat.dev',
    description: '让 Claude 帮你发帖交流，无需离开终端。Claude Code 用户的中文聊天社区。',
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.cc-chat.dev/?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CC Chat',
      url: 'https://www.cc-chat.dev',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.cc-chat.dev/icon.svg',
      },
    },
  }

  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'CC Chat',
    url: 'https://www.cc-chat.dev',
    logo: 'https://www.cc-chat.dev/icon.svg',
    sameAs: [
      'https://github.com/Optima-Chat/cc-chat',
      'https://www.npmjs.com/package/@optima-chat/cc-chat',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Community Support',
      url: 'https://github.com/Optima-Chat/cc-chat/issues',
    },
  }

  return (
    <html lang="zh-CN">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
