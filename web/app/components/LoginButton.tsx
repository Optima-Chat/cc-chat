'use client'

import { useState, useEffect, useRef } from 'react'

export default function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.has('code')
    }
    return false
  })
  const [loadingMessage, setLoadingMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      return urlParams.has('code') ? '正在登录...' : '正在连接 GitHub...'
    }
    return '正在连接 GitHub...'
  })
  const [mounted, setMounted] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('cc_token')
    const user = localStorage.getItem('cc_username')
    if (token && user) {
      setIsLoggedIn(true)
      setUsername(user)
    }

    // 检测 GitHub OAuth 回调
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    if (code) {
      handleGithubCallback(code)
    }
  }, [])

  const handleGithubCallback = async (code: string) => {
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

      setIsLoggedIn(true)
      setUsername(data.user.username)
      setLoading(false)

      // 清除 URL 中的 code 参数
      window.history.replaceState({}, '', window.location.pathname)
      window.location.reload()
    } catch (error) {
      alert('GitHub 登录失败，请重试')
      setLoading(false)
      // 清除 URL 中的 code 参数
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleGithubLogin = () => {
    setLoading(true)
    setLoadingMessage('正在连接 GitHub...')
    const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || 'Iv23listyDH5mTlavL8e'
    const redirectUri = encodeURIComponent(window.location.origin)
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=read:user`
    window.location.href = githubAuthUrl
  }

  const handleLogout = () => {
    localStorage.removeItem('cc_token')
    localStorage.removeItem('cc_username')
    setIsLoggedIn(false)
    setUsername('')
    setShowMenu(false)
    window.location.reload()
  }

  // 防止初始渲染闪烁
  if (!mounted) {
    return (
      <div className="w-24 h-10 bg-gray-100 rounded-lg animate-pulse" />
    )
  }

  return (
    <>
      {isLoggedIn ? (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="max-w-[80px] sm:max-w-none truncate">{username}</span>
            <svg className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                </svg>
                退出登录
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={handleGithubLogin}
          disabled={loading}
          className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition shadow-sm flex items-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              连接 GitHub...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub 登录
            </>
          )}
        </button>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{loadingMessage}</h3>
              <p className="text-sm text-gray-600">请稍候...</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
