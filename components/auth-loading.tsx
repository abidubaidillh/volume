'use client'

import { LoadingSpinner } from './loading-spinner'

export function AuthLoading() {
  return (
    <div className="flex items-center gap-3">
      {/* Avatar Skeleton */}
      <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" />
      
      {/* Name Skeleton */}
      <div className="hidden sm:block">
        <div className="h-4 w-16 bg-zinc-200 rounded animate-pulse" />
      </div>
      
      {/* Loading Spinner */}
      <LoadingSpinner size="sm" className="text-zinc-400" />
    </div>
  )
}