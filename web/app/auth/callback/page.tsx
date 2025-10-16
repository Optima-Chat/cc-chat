'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function AuthCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')

    if (!code) {
      setError('授权失败：缺少授权码')
      return
    }

    const handleCallback = async () => {
      try {
        const res = await fetch('https://api.cc-chat.dev/api/auth/github/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!res.ok) {
          throw new Error('GitHub 登录失败')
        }

        const data = await res.json()
        localStorage.setItem('cc_token', data.token)
        localStorage.setItem('cc_username', data.user.username)

        // 登录成功，跳转到首页
        router.push('/')
      } catch (error) {
        setError('登录失败，请重试')
        console.error(error)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full mx-4">
        {error ? (
          <>
            <div className="text-center">
              <div className="text-red-500 text-2xl mb-4">✕</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">登录失败</h2>
              <p className="text-gray-600">{error}</p>
              <p className="text-sm text-gray-500 mt-4">正在返回首页...</p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">正在登录</h2>
              <p className="text-gray-600">请稍候...</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">加载中</h2>
          </div>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
