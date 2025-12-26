'use client'

import { TrendingUp, ExternalLink } from 'lucide-react'
import { DashboardCard } from './ui/dashboard-card'
import { StarRating } from './ui/star-rating'
import { getBookCoverUrl } from '@/lib/image-utils'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import Link from 'next/link'
import Image from 'next/image'
import type { GoogleBook } from '@/services/books'

interface TrendingBooksWidgetProps {
  limit?: number
}

export function TrendingBooksWidget({ limit = 6 }: TrendingBooksWidgetProps) {
  const { trendingBooks, loading, errors } = useDashboardData('')

  const getBookCover = (book: GoogleBook) => {
    return getBookCoverUrl(book.volumeInfo)
  }

  const getBookAuthors = (book: GoogleBook) => {
    return book.volumeInfo.authors?.join(', ') || 'Penulis Tidak Diketahui'
  }

  const truncateTitle = (title: string, maxLength: number = 40) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title
  }

  const displayBooks = trendingBooks.slice(0, limit)

  return (
    <DashboardCard
      title="Buku Trending"
      subtitle="Bacaan populer saat ini"
      icon={TrendingUp}
      iconColor="bg-orange-100 text-orange-600"
      loading={loading.trending}
    >
      {errors.trending ? (
        <div className="text-center py-8 text-zinc-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-sm">{errors.trending}</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-3 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ExternalLink className="h-4 w-4" />
            Jelajahi semua buku
          </Link>
        </div>
      ) : !loading.trending && displayBooks.length === 0 ? (
        <div className="text-center py-8 text-zinc-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-3 text-zinc-300" />
          <p className="text-sm">Tidak ada buku trending tersedia</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 mt-3 text-sm text-zinc-600 hover:text-zinc-900"
          >
            <ExternalLink className="h-4 w-4" />
            Jelajahi semua buku
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {displayBooks.map((book) => (
              <Link
                key={book.id}
                href={`/book/${book.id}`}
                className="group block p-3 rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Image
                      src={getBookCover(book)}
                      alt={book.volumeInfo.title}
                      width={48}
                      height={72}
                      className="rounded object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-zinc-900 group-hover:text-zinc-700 line-clamp-2">
                      {truncateTitle(book.volumeInfo.title)}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      {getBookAuthors(book)}
                    </p>
                    
                    {book.volumeInfo.averageRating && (
                      <div className="flex items-center gap-1 mt-2">
                        <StarRating 
                          rating={book.volumeInfo.averageRating} 
                          readonly 
                          size="sm" 
                        />
                        <span className="text-xs text-zinc-500">
                          ({book.volumeInfo.ratingsCount || 0})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          <div className="pt-4 border-t border-zinc-100 text-center">
            <Link
              href="/search?sort=trending"
              className="inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              Lihat semua buku trending
            </Link>
          </div>
        </div>
      )}
    </DashboardCard>
  )
}