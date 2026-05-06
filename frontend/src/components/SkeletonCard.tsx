export function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded-xl p-4 flex items-center gap-4 animate-pulse">
      <div className="flex-1 min-w-0">
        <div className="h-4 bg-gray-700 rounded w-48 mb-2" />
        <div className="h-3 bg-gray-800 rounded w-72" />
      </div>
      <div className="h-6 bg-gray-700 rounded-full w-20 shrink-0" />
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="bg-gray-900 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-gray-700 rounded w-20 mb-2" />
      <div className="h-8 bg-gray-800 rounded w-12" />
    </div>
  )
}
