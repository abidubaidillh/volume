import { StarRating } from './ui/star-rating'
import type { Review } from '@/lib/database'

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">No reviews yet. Be the first to review this book!</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold text-zinc-900 mb-6">
        Reviews ({reviews.length})
      </h3>
      
      {reviews.map((review) => (
        <div key={review.id} className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {review.profiles.avatar_url ? (
                <img
                  src={review.profiles.avatar_url}
                  alt={review.profiles.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
                  <span className="text-zinc-600 font-medium text-sm">
                    {review.profiles.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h4 className="font-medium text-zinc-900">
                  {review.profiles.username}
                </h4>
                <p className="text-sm text-zinc-500">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>
            <StarRating rating={review.rating} readonly size="sm" />
          </div>
          
          {review.comment && (
            <p className="text-zinc-700 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}