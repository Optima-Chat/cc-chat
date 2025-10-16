export default function PostSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm flex animate-pulse">
      {/* 投票区域 */}
      <div className="flex flex-col items-center p-4 bg-gray-50 rounded-l-lg space-y-2">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-8 h-6 bg-gray-200 rounded"></div>
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 p-6 space-y-3">
        {/* 标签 */}
        <div className="flex gap-2">
          <div className="w-16 h-6 bg-gray-200 rounded"></div>
          <div className="w-20 h-6 bg-gray-200 rounded"></div>
        </div>

        {/* 标题 */}
        <div className="w-3/4 h-7 bg-gray-300 rounded"></div>

        {/* 元信息 */}
        <div className="flex gap-2">
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
        </div>

        {/* 内容预览 */}
        <div className="space-y-2">
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-full h-4 bg-gray-200 rounded"></div>
          <div className="w-2/3 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}
