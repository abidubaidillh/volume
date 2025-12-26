export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="h-6 bg-zinc-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Book Cover Skeleton */}
          <div className="lg:col-span-1">
            <div className="w-full max-w-sm mx-auto aspect-[2/3] bg-zinc-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Right Column - Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="h-12 bg-zinc-200 rounded mb-4 animate-pulse"></div>
              <div className="h-6 bg-zinc-200 rounded w-64 mb-6 animate-pulse"></div>
              <div className="h-6 bg-zinc-200 rounded w-48 mb-6 animate-pulse"></div>
              <div className="space-y-3">
                <div className="h-4 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-200 rounded animate-pulse"></div>
                <div className="h-4 bg-zinc-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}