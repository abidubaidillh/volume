import { Suspense } from 'react'
import { SearchResults } from '@/components/search-results'
import { SearchHeader } from '@/components/search-header'
import { BookOpen } from 'lucide-react'

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ''

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <SearchHeader query={query} />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {query ? (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                Search Results
              </h1>
              <p className="text-zinc-600">
                Showing results for "{query}"
              </p>
            </div>
            
            <Suspense fallback={<SearchResultsSkeleton />}>
              <SearchResults query={query} />
            </Suspense>
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-zinc-400 mx-auto mb-6" />
            <h1 className="text-2xl font-semibold text-zinc-900 mb-4">
              Search for Books
            </h1>
            <p className="text-zinc-600 max-w-md mx-auto">
              Enter a book title, author name, or ISBN in the search bar above to find your next great read.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-zinc-200 p-4 animate-pulse">
          <div className="w-full h-48 bg-zinc-200 rounded-md mb-4"></div>
          <div className="h-4 bg-zinc-200 rounded mb-2"></div>
          <div className="h-3 bg-zinc-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-zinc-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  )
}