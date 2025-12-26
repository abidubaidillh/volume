import Image from 'next/image'
import Link from 'next/link'
import { GoogleBook } from '@/services/books'
import { getBookCoverUrl } from '@/lib/image-utils'
import { BookOpen } from 'lucide-react'

interface BookCardProps {
  book: GoogleBook
}

export function BookCard({ book }: BookCardProps) {
  const { volumeInfo } = book
  const title = volumeInfo.title || 'Untitled'
  const authors = volumeInfo.authors?.join(', ') || 'Unknown Author'
  const thumbnail = getBookCoverUrl(volumeInfo)
  const publishedYear = volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null

  return (
    <Link 
      href={`/book/${book.id}`}
      className="bg-white rounded-lg shadow-sm border border-zinc-200 p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02] block group"
    >
      {/* Book Cover */}
      <div className="relative mb-4">
        {thumbnail ? (
          <div className="relative w-full aspect-[2/3] rounded-md overflow-hidden bg-zinc-100">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        ) : (
          <div className="w-full aspect-[2/3] bg-zinc-200 rounded-md flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-zinc-400" />
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-zinc-900 line-clamp-2 group-hover:text-zinc-700 transition-colors duration-200">
          {title}
        </h3>
        
        <p className="text-zinc-600 text-sm line-clamp-1">
          by {authors}
        </p>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          {publishedYear && (
            <span>{publishedYear}</span>
          )}
          
          {volumeInfo.averageRating && (
            <div className="flex items-center">
              <span>★ {volumeInfo.averageRating}</span>
              {volumeInfo.ratingsCount && (
                <span className="ml-1">({volumeInfo.ratingsCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Categories */}
        {volumeInfo.categories && volumeInfo.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {volumeInfo.categories.slice(0, 2).map((category: string) => (
              <span
                key={category}
                className="px-2 py-1 bg-zinc-100 text-zinc-600 rounded text-xs font-medium"
              >
                {category}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}