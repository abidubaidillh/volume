import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const error = requestUrl.searchParams.get('error')
    const errorDescription = requestUrl.searchParams.get('error_description')
    const redirectTo = requestUrl.searchParams.get('redirect') || '/'

    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error, errorDescription)
      const loginUrl = new URL('/login', requestUrl.origin)
      loginUrl.searchParams.set('error', error)
      loginUrl.searchParams.set('message', errorDescription || 'Authentication failed')
      return NextResponse.redirect(loginUrl.toString())
    }

    if (code) {
      const supabase = createRouteHandlerClient({ cookies })
      
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('Auth callback error:', exchangeError)
        const loginUrl = new URL('/login', requestUrl.origin)
        loginUrl.searchParams.set('error', 'auth_callback_error')
        loginUrl.searchParams.set('message', 'Failed to complete authentication')
        return NextResponse.redirect(loginUrl.toString())
      }

      // Ensure user profile exists
      if (data.user) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single()

          // Create profile if it doesn't exist
          if (profileError && profileError.code === 'PGRST116') {
            const username = data.user.user_metadata?.username || 
                           data.user.user_metadata?.full_name || 
                           data.user.email?.split('@')[0] || 
                           `user_${data.user.id.substring(0, 8)}`

            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                username,
                avatar_url: data.user.user_metadata?.avatar_url || null,
                bio: null
              })

            if (insertError) {
              console.error('Failed to create profile:', insertError)
              // Don't fail the login, just log the error
            }
          }
        } catch (profileError) {
          console.error('Profile check/creation error:', profileError)
          // Don't fail the login, just log the error
        }
      }
    }

    // Successful authentication - redirect to intended page
    const redirectUrl = new URL(redirectTo, requestUrl.origin)
    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error('Unexpected auth callback error:', error)
    const loginUrl = new URL('/login', requestUrl.origin)
    loginUrl.searchParams.set('error', 'unexpected_error')
    loginUrl.searchParams.set('message', 'An unexpected error occurred')
    return NextResponse.redirect(loginUrl.toString())
  }
}