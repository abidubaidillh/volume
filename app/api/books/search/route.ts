import { NextRequest, NextResponse } from 'next/server'
import { searchBooks } from '@/services/books'
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
    const query = searchParams.get('q')
    const maxResults = parseInt(searchParams.get('maxResults') || '20')

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (maxResults > 40) {
      return NextResponse.json(
        { error: 'Maximum results cannot exceed 40' },
        { status: 400 }
      )
    }

    const books = await searchBooks(query, maxResults)
    
    return NextResponse.json(books, {
      headers: getRateLimitHeaders(searchRateLimiter, clientIP)
    })
  } catch (error) {
    logError('books/search', error, { query: request.url })
    const errorResponse = handleAPIError(error)
    
    return NextResponse.json(
      { error: errorResponse.error },
      { status: errorResponse.statusCode }
    )
  }
}