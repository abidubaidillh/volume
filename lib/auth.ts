import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      // Only log non-auth session errors
      if (error.message !== 'Auth session missing!' && !error.message.includes('AuthSessionMissingError')) {
        console.error('Error getting user:', error)
      }
      return null
    }

    return user
  } catch (error: any) {
    // Handle AuthSessionMissingError gracefully - this is normal when user is not logged in
    if (error?.message === 'Auth session missing!' || error?.__isAuthError) {
      return null
    }
    console.error('Auth session error:', error)
    return null
  }
}

export async function getCurrentSession() {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      // Only log non-auth session errors
      if (error.message !== 'Auth session missing!' && !error.message.includes('AuthSessionMissingError')) {
        console.error('Error getting session:', error)
      }
      return null
    }

    return session
  } catch (error: any) {
    // Handle AuthSessionMissingError gracefully - this is normal when user is not logged in
    if (error?.message === 'Auth session missing!' || error?.__isAuthError) {
      return null
    }
    console.error('Session error:', error)
    return null
  }
}