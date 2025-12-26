import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { username, excludeUserId } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Check if username is valid format
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
      }, { status: 400 })
    }

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
      return NextResponse.json({ available: true })
    }

    if (error) {
      console.error('Error checking username:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }

    // Username exists
    return NextResponse.json({ available: false })
  } catch (error) {
    console.error('Error in check-username:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}