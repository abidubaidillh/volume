'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthStateManagerProps {
  children: React.ReactNode
  initialUser: User | null
}

export function AuthStateManager({ children, initialUser }: AuthStateManagerProps) {
  const [user, setUser] = useState<User | null>(initialUser)
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_IN') {
          // Refresh the page to update server components
          router.refresh()
        }
        
        if (event === 'SIGNED_OUT') {
          // Refresh and redirect to home
          router.refresh()
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  return <>{children}</>
}