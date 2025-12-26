interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-zinc-200 rounded ${className}`} />
  )
}

export function BookCardSkeleton() {
  return (
    <div className="p-3 rounded-lg border border-zinc-200">
      <div className="flex gap-3">
        <Skeleton className="w-12 h-18 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function ActivityItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton className="w-4 h-4 rounded-full flex-shrink-0 mt-1" />
      <div className="flex gap-3 flex-1">
        <Skeleton className="w-8 h-12 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  )
}