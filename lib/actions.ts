'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createReviewAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  
  const bookId = formData.get('bookId') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      book_id: bookId,
      rating,
      comment: comment || null
    })

  if (error) {
    throw new Error('Failed to create review')
  }

  revalidatePath(`/book/[id]`, 'page')
}

export async function updateReviewAction(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  
  const reviewId = formData.get('reviewId') as string
  const rating = parseInt(formData.get('rating') as string)
  const comment = formData.get('comment') as string
  
  const { error } = await supabase
    .from('reviews')
    .update({
      rating,
      comment: comment || null
    })
    .eq('id', reviewId)

  if (error) {
    throw new Error('Failed to update review')
  }

  revalidatePath(`/book/[id]`, 'page')
}