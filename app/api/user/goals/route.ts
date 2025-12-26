import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { updateUserGoals, getUserGoals } from '@/services/dashboard'

export async function POST(request: NextRequest) {
  try {
    const { userId, yearlyGoal, monthlyGoal } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const result = await updateUserGoals(userId, { yearlyGoal, monthlyGoal })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error saving user goals:', error)
    return NextResponse.json(
      { error: 'Failed to save user goals' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Verify user authentication
    const supabase = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const goals = await getUserGoals(userId)
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching user goals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user goals' },
      { status: 500 }
    )
  }
}