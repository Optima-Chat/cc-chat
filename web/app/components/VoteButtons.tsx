'use client'

interface VoteButtonsProps {
  postId: number
  score: number
}

export default function VoteButtons({ postId, score }: VoteButtonsProps) {
  const handleVote = async (value: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // TODO: 实现投票 API 调用
    console.log('Vote:', postId, value)
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-l-lg">
      <button
        onClick={(e) => handleVote(1, e)}
        className="text-gray-400 hover:text-orange-500 transition"
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
        className="text-gray-400 hover:text-blue-500 transition"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 17L5 12H15L10 17Z" />
        </svg>
      </button>
    </div>
  )
}
