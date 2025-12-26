import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function getAuthenticatedUser() {
  try {
    const supabase = createServerComponentClient({ cookies })
    
    // First check if we have a session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return null
    }

    // If we have a session, get the user
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return user
  } catch (error: any) {
    // Silently handle auth errors - this is normal when user is not logged in
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  } catch (error) {
    return false
  }
}