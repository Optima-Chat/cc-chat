'use client'

import { useState } from 'react'

interface VoteButtonsProps {
  postId: number
  initialScore: number
}

export default function VoteButtons({ postId, initialScore }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [voting, setVoting] = useState(false)

  const handleVote = async (value: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (voting) return

    // 检查是否登录
    const token = localStorage.getItem('cc_token')
    if (!token) {
      alert('请先登录再投票')
      return
    }

    setVoting(true)

    // 乐观更新 UI
    setScore(score + value)

    try {
      const res = await fetch(`https://api.cc-chat.dev/api/posts/${postId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      })

      if (!res.ok) {
        // 如果失败，回滚
        setScore(score)
        if (res.status === 401) {
          alert('登录已过期，请重新登录')
          localStorage.removeItem('cc_token')
          localStorage.removeItem('cc_username')
        } else {
          alert('投票失败')
        }
      }
    } catch (error) {
      // 如果出错，回滚
      setScore(score)
      alert('投票出错')
    } finally {
      setVoting(false)
    }
  }

  return (
    <div
      className="flex flex-col items-center p-4 bg-gray-50 rounded-l-lg"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => handleVote(1, e)}
        className="text-gray-400 hover:text-orange-500 transition disabled:opacity-50"
        disabled={voting}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 3L15 8H5L10 3Z" />
        </svg>
      </button>
      <span className="text-lg font-semibold my-1">
        {score}
      </span>
      <button
        onClick={(e) => handleVote(-1, e)}
        className="text-gray-400 hover:text-blue-500 transition disabled:opacity-50"
        disabled={voting}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 17L5 12H15L10 17Z" />
        </svg>
      </button>
    </div>
  )
}
