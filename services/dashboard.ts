import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { searchBooks, GoogleBook } from './books'

export interface ReadingStats {
  totalReviews: number
  averageRating: number
  booksThisMonth: number
  booksThisYear: number
  favoriteGenres: string[]
  readingStreak: number
}

export interface RecentActivity {
  id: string
  type: 'review' | 'wishlist' | 'reading_list'
  book_title: string
  book_author: string
  book_cover: string | null
  rating?: number
  created_at: string
}

export interface BookRecommendation {
  book: GoogleBook
  reason: string
  score: number
}

export interface ReadingListItem {
  id: string
  book_id: string
  book_title: string
  book_author: string
  book_cover: string | null
  status: 'want_to_read' | 'currently_reading' | 'completed'
  added_at: string
  started_at?: string
  completed_at?: string
  progress?: number
}

export interface WishlistItem {
  id: string
  book_id: string
  book_title: string
  book_author: string
  book_cover: string | null
  added_at: string
  priority: 'low' | 'medium' | 'high'
}

export async function getUserReadingStats(userId: string): Promise<ReadingStats> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Use the database function for better performance
    const { data: statsData, error: statsError } = await supabase
      .rpc('get_user_reading_stats', { user_uuid: userId })

    if (statsError) {
      console.error('Error fetching stats with function:', statsError)
      // Fallback to manual calculation
      return await calculateStatsManually(userId)
    }

    return statsData || getDefaultStats()
  } catch (error) {
    console.error('Error getting reading stats:', error)
    return getDefaultStats()
  }
}

async function calculateStatsManually(userId: string): Promise<ReadingStats> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get all user reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        rating,
        created_at,
        books_metadata (
          title,
          author
        )
      `)
      .eq('user_id', userId)

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return getDefaultStats()
    }

    const totalReviews = reviews?.length || 0
    const averageRating = totalReviews > 0 
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10
      : 0

    // Calculate books this month and year
    const now = new Date()
    const thisMonth = reviews?.filter(r => {
      const reviewDate = new Date(r.created_at)
      return reviewDate.getMonth() === now.getMonth() && 
             reviewDate.getFullYear() === now.getFullYear()
    }).length || 0

    const thisYear = reviews?.filter(r => {
      const reviewDate = new Date(r.created_at)
      return reviewDate.getFullYear() === now.getFullYear()
    }).length || 0

    // Calculate reading streak (consecutive days with reviews)
    const readingStreak = calculateReadingStreak(reviews || [])

    return {
      totalReviews,
      averageRating,
      booksThisMonth: thisMonth,
      booksThisYear: thisYear,
      favoriteGenres: [], // Will implement genre tracking later
      readingStreak
    }
  } catch (error) {
    console.error('Error calculating stats manually:', error)
    return getDefaultStats()
  }
}

export async function getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Get recent reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        created_at,
        books_metadata (
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (reviewsError) {
      console.error('Error fetching reviews for activity:', reviewsError)
    }

    // Get recent wishlist additions
    const { data: wishlistItems, error: wishlistError } = await supabase
      .from('wishlist')
      .select(`
        id,
        created_at,
        books_metadata (
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (wishlistError) {
      console.error('Error fetching wishlist for activity:', wishlistError)
    }

    // Get recent reading list additions
    const { data: readingListItems, error: readingListError } = await supabase
      .from('reading_list')
      .select(`
        id,
        created_at,
        books_metadata (
          title,
          author,
          cover_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (readingListError) {
      console.error('Error fetching reading list for activity:', readingListError)
    }

    // Combine all activities
    const activities: RecentActivity[] = []

    // Add reviews
    if (reviews) {
      reviews.forEach(review => {
        activities.push({
          id: review.id,
          type: 'review',
          book_title: review.books_metadata?.title || 'Unknown Title',
          book_author: review.books_metadata?.author || 'Unknown Author',
          book_cover: review.books_metadata?.cover_url || null,
          rating: review.rating,
          created_at: review.created_at
        })
      })
    }

    // Add wishlist items
    if (wishlistItems) {
      wishlistItems.forEach(item => {
        activities.push({
          id: item.id,
          type: 'wishlist',
          book_title: item.books_metadata?.title || 'Unknown Title',
          book_author: item.books_metadata?.author || 'Unknown Author',
          book_cover: item.books_metadata?.cover_url || null,
          created_at: item.created_at
        })
      })
    }

    // Add reading list items
    if (readingListItems) {
      readingListItems.forEach(item => {
        activities.push({
          id: item.id,
          type: 'reading_list',
          book_title: item.books_metadata?.title || 'Unknown Title',
          book_author: item.books_metadata?.author || 'Unknown Author',
          book_cover: item.books_metadata?.cover_url || null,
          created_at: item.created_at
        })
      })
    }

    // Sort by date and return limited results
    return activities
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
  } catch (error) {
    console.error('Error getting recent activity:', error)
    return []
  }
}

export async function getUserGoals(userId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data: goals, error } = await supabase
      .from('user_goals')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw error
    }

    return goals || {
      yearly_goal: 24,
      monthly_goal: 2
    }
  } catch (error) {
    console.error('Error fetching user goals:', error)
    return {
      yearly_goal: 24,
      monthly_goal: 2
    }
  }
}

export async function updateUserGoals(userId: string, goals: { yearlyGoal?: number; monthlyGoal?: number }) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data, error } = await supabase
      .from('user_goals')
      .upsert({
        user_id: userId,
        ...(goals.yearlyGoal !== undefined && { yearly_goal: goals.yearlyGoal }),
        ...(goals.monthlyGoal !== undefined && { monthly_goal: goals.monthlyGoal }),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) throw error
    
    return data
  } catch (error) {
    console.error('Error updating user goals:', error)
    throw error
  }
}

function calculateReadingStreak(reviews: any[]): number {
  if (!reviews || reviews.length === 0) return 0

  const reviewDates = reviews
    .map(r => new Date(r.created_at).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort descending

  let streak = 0
  const today = new Date().toDateString()
  let currentDate = new Date()

  for (let i = 0; i < reviewDates.length; i++) {
    const reviewDate = reviewDates[i]
    const expectedDate = new Date(currentDate).toDateString()

    if (reviewDate === expectedDate) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

function getDefaultStats(): ReadingStats {
  return {
    totalReviews: 0,
    averageRating: 0,
    booksThisMonth: 0,
    booksThisYear: 0,
    favoriteGenres: [],
    readingStreak: 0
  }
}