'use client'

import { useState, useRef } from 'react'

interface VoteButtonsProps {
  postId: number
  initialScore: number
  initialUserVote?: 1 | -1 | 0
  orientation?: 'vertical' | 'horizontal'
}

type VoteState = 1 | -1 | 0

export default function VoteButtons({ postId, initialScore, initialUserVote = 0, orientation = 'vertical' }: VoteButtonsProps) {
  const [score, setScore] = useState(initialScore)
  const [voting, setVoting] = useState(false)
  const [userVote, setUserVote] = useState<VoteState>(initialUserVote) // 从API获取初始投票状态
  const userVoteRef = useRef<VoteState>(initialUserVote) // 使用 ref 追踪最新状态

  const handleVote = async (value: 1 | -1, e: React.MouseEvent) => {
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

    // 使用 ref 读取最新状态，避免异步更新问题
    const currentVote = userVoteRef.current

    // 计算新的分数和投票状态
    let newScore = score
    let newVoteState: VoteState = value

    if (currentVote === value) {
      // 点击已投的票 → 取消投票
      newScore = score - value
      newVoteState = 0
    } else if (currentVote === 0) {
      // 未投票 → 新投票
      newScore = score + value
      newVoteState = value
    } else {
      // 改变投票方向 (upvote ↔ downvote)
      newScore = score + (value * 2) // 例如：从 -1 改到 +1，变化是 +2
      newVoteState = value
    }

    // 乐观更新 UI
    const oldScore = score
    const oldVote = currentVote
    setScore(newScore)
    setUserVote(newVoteState)
    userVoteRef.current = newVoteState // 立即更新 ref

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
        setScore(oldScore)
        setUserVote(oldVote)
        userVoteRef.current = oldVote // 回滚 ref
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
      setScore(oldScore)
      setUserVote(oldVote)
      userVoteRef.current = oldVote // 回滚 ref
      alert('投票出错')
    } finally {
      setVoting(false)
    }
  }

  if (orientation === 'horizontal') {
    return (
      <div
        className="flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => handleVote(1, e)}
          className={`transition disabled:opacity-50 ${
            userVote === 1
              ? 'text-orange-500'
              : 'text-gray-400 hover:text-orange-500'
          }`}
          disabled={voting}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 3L15 8H5L10 3Z" />
          </svg>
        </button>
        <span className="text-sm font-semibold min-w-[24px] text-center">
          {score}
        </span>
        <button
          onClick={(e) => handleVote(-1, e)}
          className={`transition disabled:opacity-50 ${
            userVote === -1
              ? 'text-blue-500'
              : 'text-gray-400 hover:text-blue-500'
          }`}
          disabled={voting}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 17L5 12H15L10 17Z" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={(e) => handleVote(1, e)}
        className={`transition disabled:opacity-50 ${
          userVote === 1
            ? 'text-orange-500'
            : 'text-gray-400 hover:text-orange-500'
        }`}
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
        className={`transition disabled:opacity-50 ${
          userVote === -1
            ? 'text-blue-500'
            : 'text-gray-400 hover:text-blue-500'
        }`}
        disabled={voting}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 17L5 12H15L10 17Z" />
        </svg>
      </button>
    </div>
  )
}
