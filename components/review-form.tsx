'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { StarRating } from './ui/star-rating'
import { createReview, updateReview } from '@/lib/database-client'
import type { Review } from '@/lib/database'

interface ReviewFormProps {
  bookId: string
  userId: string
  existingReview?: Review | null
}

export function ReviewForm({ bookId, userId, existingReview }: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setError(null)
    
    startTransition(async () => {
      try {
        let success = false
        
        if (existingReview) {
          success = await updateReview(existingReview.id, {
            rating,
            comment: comment.trim() || undefined
          })
        } else {
          success = await createReview({
            user_id: userId,
            book_id: bookId,
            rating,
            comment: comment.trim() || undefined
          })
        }

        if (success) {
          router.refresh()
          if (!existingReview) {
            setRating(0)
            setComment('')
          }
        } else {
          setError('Failed to save review. Please try again.')
        }
      } catch (err) {
        setError('An error occurred. Please try again.')
        console.error('Review submission error:', err)
      }
    })
  }

  return (
    <div className="bg-white rounded-lg border border-zinc-200 p-6">
      <h3 className="text-xl font-semibold text-zinc-900 mb-4">
        {existingReview ? 'Update Your Review' : 'Write a Review'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Rating
          </label>
          <StarRating
            rating={rating}
            onRatingChange={setRating}
            size="lg"
          />
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-zinc-700 mb-2">
            Review (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts about this book..."
            rows={4}
            className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent resize-none"
            disabled={isPending}
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending || rating === 0}
          className="w-full bg-zinc-900 text-white py-2 px-4 rounded-md hover:bg-zinc-800 disabled:bg-zinc-400 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
        >
          {isPending ? 'Saving...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  )
}