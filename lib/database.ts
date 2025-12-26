import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export interface Review {
  id: string
  user_id: string
  book_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export interface BookMetadata {
  id: string
  google_books_id: string
  title: string
  author: string
  cover_url: string | null
  created_at: string
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!userId) return null

  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      console.error('Error fetching profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getProfile:', error)
    return null
  }
}

export async function createProfile(userData: {
  id: string
  username: string
  avatar_url?: string
  bio?: string
}): Promise<Profile | null> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('profiles')
      .insert(userData)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createProfile:', error)
    return null
  }
}

export async function updateProfile(userId: string, updates: {
  username?: string
  avatar_url?: string
  bio?: string
}): Promise<Profile | null> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateProfile:', error)
    return null
  }
}

export async function checkUsernameAvailability(username: string, excludeUserId?: string): Promise<boolean> {
  try {
    const supabase = createServerComponentClient({ cookies })
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username)

    if (excludeUserId) {
      query = query.neq('id', excludeUserId)
    }

    const { data, error } = await query.single()

    if (error && error.code === 'PGRST116') {
      // No rows found, username is available
      return true
    }

    if (error) {
      console.error('Error checking username availability:', error)
      return false
    }

    // Username exists
    return false
  } catch (error) {
    console.error('Error in checkUsernameAvailability:', error)
    return false
  }
}

export async function getBookReviews(bookId: string): Promise<Review[]> {
  if (!bookId || bookId.trim() === '') {
    return []
  }

  try {
    const supabase = createServerComponentClient({ cookies })
    
    // Add retry logic for connection issues
    let retries = 3
    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('book_id', bookId)
          .order('created_at', { ascending: false })

        if (error) {
          // Only log actual database errors, not auth errors
          if (!error.message.includes('Auth') && !error.message.includes('session')) {
            console.error('Error fetching reviews:', error)
          }
          return []
        }

        return data || []
      } catch (connectionError: any) {
        retries--
        if (retries === 0) throw connectionError
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    return []
  } catch (error: any) {
    // Handle auth errors gracefully
    if (error?.__isAuthError || error?.message?.includes('Auth session missing')) {
      return []
    }
    console.error('Error in getBookReviews:', error)
    return []
  }
}

export async function getBookMetadata(googleBooksId: string): Promise<BookMetadata | null> {
  if (!googleBooksId || googleBooksId.trim() === '') {
    return null
  }

  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('books_metadata')
      .select('*')
      .eq('google_books_id', googleBooksId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found, return null
        return null
      }
      // Only log actual database errors, not auth errors
      if (!error.message.includes('Auth') && !error.message.includes('session')) {
        console.error('Error fetching book metadata:', error)
      }
      return null
    }

    return data
  } catch (error: any) {
    // Handle auth errors gracefully
    if (error?.__isAuthError || error?.message?.includes('Auth session missing')) {
      return null
    }
    console.error('Error in getBookMetadata:', error)
    return null
  }
}

export async function createBookMetadata(bookData: {
  google_books_id: string
  title: string
  author: string
  cover_url?: string
}): Promise<BookMetadata | null> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('books_metadata')
      .insert(bookData)
      .select()
      .single()

    if (error) {
      // Only log actual database errors, not auth errors
      if (!error.message.includes('Auth') && !error.message.includes('session')) {
        console.error('Error creating book metadata:', error)
      }
      return null
    }

    return data
  } catch (error: any) {
    // Handle auth errors gracefully
    if (error?.__isAuthError || error?.message?.includes('Auth session missing')) {
      return null
    }
    console.error('Error in createBookMetadata:', error)
    return null
  }
}

export async function createReview(reviewData: {
  user_id: string
  book_id: string
  rating: number
  comment?: string
}): Promise<boolean> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { error } = await supabase
      .from('reviews')
      .insert(reviewData)

    if (error) {
      console.error('Error creating review:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in createReview:', error)
    return false
  }
}

export async function updateReview(reviewId: string, reviewData: {
  rating: number
  comment?: string
}): Promise<boolean> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { error } = await supabase
      .from('reviews')
      .update(reviewData)
      .eq('id', reviewId)

    if (error) {
      console.error('Error updating review:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateReview:', error)
    return false
  }
}

export async function getUserReview(userId: string, bookId: string): Promise<Review | null> {
  if (!userId || !bookId || userId.trim() === '' || bookId.trim() === '') {
    return null
  }

  try {
    const supabase = createServerComponentClient({ cookies })
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found, return null
        return null
      }
      // Only log actual database errors, not auth errors
      if (!error.message.includes('Auth') && !error.message.includes('session')) {
        console.error('Error fetching user review:', error)
      }
      return null
    }

    return data
  } catch (error: any) {
    // Handle auth errors gracefully
    if (error?.__isAuthError || error?.message?.includes('Auth session missing')) {
      return null
    }
    console.error('Error in getUserReview:', error)
    return null
  }
}

export function calculateAverageRating(reviews: Review[]): number {
  if (reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round((sum / reviews.length) * 10) / 10
}