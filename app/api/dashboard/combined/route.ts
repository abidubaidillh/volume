import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getUserReadingStats, getRecentActivity } from '@/services/dashboard'
import { getTrendingBooks } from '@/services/books'
import { statsCache, generateCacheKey } from '@/lib/cache'

/**
 * Combined API endpoint to fetch all dashboard data in one request
 * Reduces the number of API calls and improves performance
 */
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

    // Check cache first
    const cacheKey = generateCacheKey('dashboard', userId)
    const cachedData = statsCache.get(cacheKey)
    
    if (cachedData) {
      return NextResponse.json({
        ...cachedData,
        cached: true
      })
    }

    // Fetch all data with error handling
    const [statsResult, activitiesResult, trendingResult] = await Promise.allSettled([
      getUserReadingStats(userId),
      getRecentActivity(userId, 5),
      getTrendingBooks(6)
    ])

    // Process results with fallbacks
    const stats = statsResult.status === 'fulfilled' ? statsResult.value : {
      totalReviews: 0,
      averageRating: 0,
      booksThisMonth: 0,
      booksThisYear: 0,
      favoriteGenres: [],
      readingStreak: 0
    }

    const activities = activitiesResult.status === 'fulfilled' ? activitiesResult.value : []
    
    const trending = trendingResult.status === 'fulfilled' ? trendingResult.value : {
      items: [],
      totalItems: 0
    }

    const responseData = {
      stats,
      activities,
      trending: trending.items || [],
      errors: {
        stats: statsResult.status === 'rejected' ? 'Gagal memuat statistik' : null,
        activities: activitiesResult.status === 'rejected' ? 'Gagal memuat aktivitas' : null,
        trending: trendingResult.status === 'rejected' ? 'Gagal memuat buku trending' : null
      }
    }

    // Cache the result for 5 minutes
    statsCache.set(cacheKey, responseData, 300)

    return NextResponse.json({
      ...responseData,
      cached: false
    })
  } catch (error) {
    console.error('Error fetching combined dashboard data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        stats: null,
        activities: [],
        trending: [],
        errors: {
          stats: 'Server error',
          activities: 'Server error', 
          trending: 'Server error'
        }
      },
      { status: 500 }
    )
  }
}