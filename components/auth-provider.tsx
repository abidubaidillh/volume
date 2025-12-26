'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
  refreshSession: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error refreshing session:', error)
        return
      }
      setSession(session)
      setUser(session?.user ?? null)
    } catch (error) {
      console.error('Unexpected error refreshing session:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting initial session:', error)
        }
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Unexpected error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            if (mounted) {
              // Ensure profile exists for new users
              if (session?.user) {
                try {
                  const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('id', session.user.id)
                    .single()

                  if (error && error.code === 'PGRST116') {
                    // Profile doesn't exist, create it
                    const username = session.user.user_metadata?.username || 
                                   session.user.user_metadata?.full_name || 
                                   session.user.email?.split('@')[0] || 
                                   `user_${session.user.id.substring(0, 8)}`

                    await supabase
                      .from('profiles')
                      .insert({
                        id: session.user.id,
                        username,
                        avatar_url: session.user.user_metadata?.avatar_url || null,
                        bio: null
                      })
                  }
                } catch (profileError) {
                  console.error('Profile creation error:', profileError)
                }
              }
              
              // Force page refresh to update server-side state
              window.location.reload()
            }
            break

          case 'SIGNED_OUT':
            if (mounted) {
              // Clear any cached data
              localStorage.removeItem('rememberedEmail')
              // Force page refresh to update server-side state
              window.location.reload()
            }
            break

          case 'TOKEN_REFRESHED':
            if (mounted) {
              router.refresh()
            }
            break

          case 'USER_UPDATED':
            if (mounted) {
              router.refresh()
            }
            break
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [router])

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}