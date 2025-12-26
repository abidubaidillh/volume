'use client'

interface DashboardSkeletonProps {
  type: 'stats' | 'activity' | 'goals' | 'trending'
}

export function DashboardSkeleton({ type }: DashboardSkeletonProps) {
  if (type === 'stats') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-zinc-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-24 h-4 bg-zinc-200 rounded animate-pulse mb-1" />
            <div className="w-16 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-200 rounded animate-pulse" />
                <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse" />
              </div>
              <div className="w-8 h-4 bg-zinc-200 rounded animate-pulse" />
            </div>
          ))}
          
          <div className="pt-2 space-y-2">
            <div className="w-full h-2 bg-zinc-200 rounded animate-pulse" />
            <div className="w-full h-2 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'activity') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-zinc-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-28 h-4 bg-zinc-200 rounded animate-pulse mb-1" />
            <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3">
              <div className="w-4 h-4 bg-zinc-200 rounded animate-pulse mt-1" />
              <div className="flex items-start gap-3 flex-1">
                <div className="w-8 h-12 bg-zinc-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-3 bg-zinc-200 rounded animate-pulse" />
                  <div className="w-3/4 h-3 bg-zinc-200 rounded animate-pulse" />
                  <div className="w-1/2 h-2 bg-zinc-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'goals') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-zinc-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-32 h-4 bg-zinc-200 rounded animate-pulse mb-1" />
            <div className="w-24 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse" />
            <div className="w-full h-3 bg-zinc-200 rounded animate-pulse" />
            <div className="w-16 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <div className="w-24 h-3 bg-zinc-200 rounded animate-pulse" />
            <div className="w-full h-3 bg-zinc-200 rounded animate-pulse" />
            <div className="w-20 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (type === 'trending') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-zinc-200 rounded-lg animate-pulse" />
          <div>
            <div className="w-28 h-4 bg-zinc-200 rounded animate-pulse mb-1" />
            <div className="w-24 h-3 bg-zinc-200 rounded animate-pulse" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-3 border border-zinc-200 rounded-lg">
              <div className="flex gap-3">
                <div className="w-12 h-18 bg-zinc-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-3 bg-zinc-200 rounded animate-pulse" />
                  <div className="w-3/4 h-3 bg-zinc-200 rounded animate-pulse" />
                  <div className="w-1/2 h-2 bg-zinc-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}