'use client'

import { useState, useEffect } from 'react'

export default function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('cc_token')
    const user = localStorage.getItem('cc_username')
    if (token && user) {
      setIsLoggedIn(true)
      setUsername(user)
    }
  }, [])

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
    window.location.reload()
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <span className="text-sm text-gray-700">
              {username}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
            >
              退出
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowDialog(true)}
            className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-800 transition"
          >
            登录
          </button>
        )}
      </div>

      {showDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">登录 CC Chat</h3>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="输入用户名"
              className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-gray-900"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleLogin}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? '登录中...' : '登录'}
              </button>
              <button
                onClick={() => {
                  setShowDialog(false)
                  setInputValue('')
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
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
