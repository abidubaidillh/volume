import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Database utilities for handling duplicate key errors and safe operations
 */

export interface BookMetadata {
  google_books_id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  published_date?: string
  page_count?: number
  categories?: string[]
  average_rating?: number
  ratings_count?: number
}

/**
 * Safely insert or update book metadata, handling duplicate key errors
 */
export async function upsertBookMetadata(bookData: BookMetadata) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    const { data, error } = await supabase
      .from('books_metadata')
      .upsert(
        {
          google_books_id: bookData.google_books_id,
          title: bookData.title,
          author: bookData.author,
          description: bookData.description || null,
          cover_url: bookData.cover_url || null,
          published_date: bookData.published_date || null,
          page_count: bookData.page_count || null,
          categories: bookData.categories || null,
          average_rating: bookData.average_rating || null,
          ratings_count: bookData.ratings_count || null,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'google_books_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error upserting book metadata:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Database error in upsertBookMetadata:', error)
    throw error
  }
}

/**
 * Safely add book to user's reading list, handling duplicates
 */
export async function addToReadingList(userId: string, bookData: BookMetadata, status: 'want_to_read' | 'currently_reading' | 'completed' = 'want_to_read') {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // First ensure book metadata exists
    await upsertBookMetadata(bookData)
    
    // Then add to reading list with conflict handling
    const { data, error } = await supabase
      .from('reading_list')
      .upsert(
        {
          user_id: userId,
          google_books_id: bookData.google_books_id,
          status,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'user_id,google_books_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error adding to reading list:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Database error in addToReadingList:', error)
    throw error
  }
}

/**
 * Safely add book to user's wishlist, handling duplicates
 */
export async function addToWishlist(userId: string, bookData: BookMetadata, priority: 'low' | 'medium' | 'high' = 'medium') {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // First ensure book metadata exists
    await upsertBookMetadata(bookData)
    
    // Then add to wishlist with conflict handling
    const { data, error } = await supabase
      .from('wishlist')
      .upsert(
        {
          user_id: userId,
          google_books_id: bookData.google_books_id,
          priority,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'user_id,google_books_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Database error in addToWishlist:', error)
    throw error
  }
}
/**
 * Safely create a book review, handling duplicates
 */
export async function createReview(userId: string, bookData: BookMetadata, rating: number, reviewText?: string) {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // First ensure book metadata exists
    await upsertBookMetadata(bookData)
    
    // Then create/update review with conflict handling
    const { data, error } = await supabase
      .from('reviews')
      .upsert(
        {
          user_id: userId,
          google_books_id: bookData.google_books_id,
          rating,
          review_text: reviewText || null,
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'user_id,google_books_id',
          ignoreDuplicates: false 
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Database error in createReview:', error)
    throw error
  }
}

/**
 * Handle database errors gracefully
 */
export function handleDatabaseError(error: any): { message: string; shouldRetry: boolean } {
  if (error?.code === '23505') {
    // Duplicate key error
    return {
      message: 'Data sudah ada dalam database',
      shouldRetry: false
    }
  }
  
  if (error?.code === '23503') {
    // Foreign key constraint error
    return {
      message: 'Referensi data tidak valid',
      shouldRetry: false
    }
  }
  
  if (error?.code === 'PGRST116') {
    // Not found error
    return {
      message: 'Data tidak ditemukan',
      shouldRetry: false
    }
  }
  
  if (error?.message?.includes('timeout')) {
    return {
      message: 'Koneksi database timeout',
      shouldRetry: true
    }
  }
  
  return {
    message: 'Terjadi kesalahan database',
    shouldRetry: true
  }
}