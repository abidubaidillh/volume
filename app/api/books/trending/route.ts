import { NextRequest, NextResponse } from 'next/server'
import { getTrendingBooks } from '@/services/books'
import { searchRateLimiter, getRateLimitHeaders } from '@/lib/rate-limiter'
import { handleAPIError, logError } from '@/lib/error-handler'

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Apply rate limiting
    if (!searchRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: getRateLimitHeaders(searchRateLimiter, clientIP)
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Validate limit parameter
    if (isNaN(limit) || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be a positive number.' },
        { status: 400 }
      )
    }

    if (limit > 40) {
      return NextResponse.json(
        { error: 'Maximum limit cannot exceed 40' },
        { status: 400 }
      )
    }

    // Add timeout to the entire operation
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 30000) // 30 second timeout
    })

    const booksPromise = getTrendingBooks(limit)
    
    const books = await Promise.race([booksPromise, timeoutPromise])

    // Ensure we always return a valid response structure
    const response = {
      items: books?.items || [],
      totalItems: books?.totalItems || 0,
      cached: false // You could add cache hit info here
    }

    return NextResponse.json(response, {
      headers: {
        ...getRateLimitHeaders(searchRateLimiter, clientIP),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // 1 hour cache, 1 day stale
      }
    })
  } catch (error) {
    logError('books/trending', error, { 
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date().toISOString()
    })
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Request timeout. Please try again later.',
            items: [],
            totalItems: 0
          },
          { status: 504 }
        )
      }
      
      if (error.message.includes('ECONNRESET')) {
        return NextResponse.json(
          { 
            error: 'Connection error. Please try again later.',
            items: [],
            totalItems: 0
          },
          { status: 503 }
        )
      }
    }
    
    const errorResponse = handleAPIError(error)
    
    // Always return a valid structure even on error
    return NextResponse.json(
      { 
        error: errorResponse.error,
        items: [],
        totalItems: 0
      },
      { status: errorResponse.statusCode }
    )
  }
}