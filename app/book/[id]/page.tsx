import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getBookById } from '@/services/books'
import { getBookReviews, getBookMetadata, createBookMetadata, getUserReview, calculateAverageRating } from '@/lib/database'
import { getAuthenticatedUser } from '@/lib/auth-utils'
import { normalizeImageUrl } from '@/lib/image-utils'
import { ReviewForm } from '@/components/review-form'
import { ReviewList } from '@/components/review-list'
import { StarRating } from '@/components/ui/star-rating'
import { UserNav } from '@/components/user-nav'
import { ArrowLeft, Calendar, BookOpen } from 'lucide-react'
import Link from 'next/link'

interface BookPageProps {
  params: {
    id: string
  }
}

export default async function BookPage({ params }: BookPageProps) {
  try {
    // Fetch book details from Google Books API
    const book = await getBookById(params.id)
    
    if (!book || !book.volumeInfo) {
      notFound()
    }

    // Get or create book metadata in our database
    let bookMetadata = await getBookMetadata(params.id)
    
    if (!bookMetadata) {
      const authors = book.volumeInfo.authors?.join(', ') || 'Unknown Author'
      const coverUrl = book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail
      
      bookMetadata = await createBookMetadata({
        google_books_id: params.id,
        title: book.volumeInfo.title,
        author: authors,
        cover_url: coverUrl
      })
    }

    // Always fetch reviews (no auth needed for reading)
    const reviews = await getBookReviews(bookMetadata?.id || '')
    
    // Only get user data if we have bookMetadata
    let currentUser = null
    let userReview = null
    
    if (bookMetadata) {
      currentUser = await getAuthenticatedUser()
      if (currentUser) {
        userReview = await getUserReview(currentUser.id, bookMetadata.id)
      }
    }

    // Calculate average rating
    const averageRating = calculateAverageRating(reviews)

    const { volumeInfo } = book
    const authors = volumeInfo.authors?.join(', ') || 'Unknown Author'
    const publishedYear = volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : null
    const categories = volumeInfo.categories?.slice(0, 3) || []

    return (
      <div className="min-h-screen bg-zinc-50">
        {/* Header */}
        <div className="bg-white border-b border-zinc-200">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link 
                href="/"
                className="inline-flex items-center text-zinc-600 hover:text-zinc-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to home
              </Link>
              
              {currentUser && (
                <UserNav user={currentUser} />
              )}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Book Cover */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                {volumeInfo.imageLinks?.thumbnail ? (
                  <div className="relative">
                    <Image
                      src={normalizeImageUrl(volumeInfo.imageLinks.thumbnail) || '/placeholder-book.svg'}
                      alt={volumeInfo.title}
                      width={400}
                      height={600}
                      className="w-full max-w-sm mx-auto rounded-lg shadow-xl"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-sm mx-auto aspect-[2/3] bg-zinc-200 rounded-lg shadow-xl flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-zinc-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Book Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Book Info */}
              <div>
                <h1 className="text-4xl font-bold text-zinc-900 mb-4 leading-tight">
                  {volumeInfo.title}
                </h1>
                
                <p className="text-xl text-zinc-600 mb-6">
                  by {authors}
                </p>

                {/* Rating and Stats */}
                <div className="flex items-center gap-6 mb-6">
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(averageRating)} readonly />
                      <span className="text-lg font-medium text-zinc-900">
                        {averageRating}
                      </span>
                      <span className="text-zinc-500">
                        ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                      </span>
                    </div>
                  )}
                  
                  {publishedYear && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Calendar className="h-4 w-4" />
                      <span>{publishedYear}</span>
                    </div>
                  )}
                  
                  {volumeInfo.pageCount && (
                    <div className="flex items-center gap-2 text-zinc-500">
                      <BookOpen className="h-4 w-4" />
                      <span>{volumeInfo.pageCount} pages</span>
                    </div>
                  )}
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {categories.map((category: string) => (
                      <span
                        key={category}
                        className="px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full text-sm font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Description */}
                {volumeInfo.description && (
                  <div className="prose prose-zinc max-w-none">
                    <h3 className="text-lg font-semibold text-zinc-900 mb-3">
                      About this book
                    </h3>
                    <div 
                      className="text-zinc-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: volumeInfo.description.replace(/<[^>]*>/g, '') 
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Review Form */}
              {currentUser && bookMetadata && (
                <ReviewForm
                  bookId={bookMetadata.id}
                  userId={currentUser.id}
                  existingReview={userReview}
                />
              )}

              {!currentUser && (
                <div className="bg-zinc-100 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                    Sign in to write a review
                  </h3>
                  <p className="text-zinc-600 mb-4">
                    Share your thoughts about this book with other readers
                  </p>
                  <Link 
                    href="/login"
                    className="inline-flex items-center bg-zinc-900 text-white px-6 py-2 rounded-md hover:bg-zinc-800 transition-colors duration-200 font-medium"
                  >
                    Login to write a review
                  </Link>
                </div>
              )}

              {/* Reviews List */}
              <ReviewList reviews={reviews} />
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading book page:', error)
    notFound()
  }
}