'use client'

import { supabase } from './supabase'

export async function createReview(reviewData: {
  user_id: string
  book_id: string
  rating: number
  comment?: string
}): Promise<boolean> {
  try {
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