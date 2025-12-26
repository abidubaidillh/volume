import { searchBooks } from '@/services/books'
import { BookCard } from './book-card'

interface SearchResultsProps {
  query: string
}

export async function SearchResults({ query }: SearchResultsProps) {
  try {
    const response = await searchBooks(query, 24)
    const books = response.items || []

    if (books.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-zinc-900 mb-2">
            No books found
          </h2>
          <p className="text-zinc-600">
            Try searching with different keywords or check your spelling.
          </p>
        </div>
      )
    }

    return (
      <div>
        <div className="mb-6">
          <p className="text-zinc-600">
            Found {response.totalItems?.toLocaleString() || books.length} results
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Search error:', error)
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-zinc-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-zinc-600">
          We couldn't search for books right now. Please try again later.
        </p>
      </div>
    )
  }
}