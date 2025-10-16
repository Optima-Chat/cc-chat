'use client'

import { useState, useEffect, useRef } from 'react'

export default function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
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
  }, [])

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

  const handleLogin = async () => {
    if (!inputValue.trim() || inputValue.length < 2) {
      alert('用户名至少 2 个字符')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('https://api.cc-chat.dev/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: inputValue.trim() }),
      })

      if (!res.ok) {
        throw new Error('登录失败')
      }

      const data = await res.json()
      localStorage.setItem('cc_token', data.token)
      localStorage.setItem('cc_username', data.user.username)

      setIsLoggedIn(true)
      setUsername(data.user.username)
      setShowDialog(false)
      setInputValue('')

      window.location.reload()
    } catch (error) {
      alert('登录失败，请重试')
    } finally {
      setLoading(false)
    }
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
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span>{username}</span>
            <svg className={`w-4 h-4 text-gray-500 transition-transform ${showMenu ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
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
          onClick={() => setShowDialog(true)}
          className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition shadow-sm"
        >
          登录
        </button>
      )}

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">欢迎来到 CC Chat</h3>
            <p className="text-sm text-gray-600 mb-6">请输入用户名登录或创建账号</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="用户名（至少 2 个字符）"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '登录中...' : '登录'}
              </button>
              <button
                onClick={() => {
                  setShowDialog(false)
                  setInputValue('')
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
