import { booksCache, generateCacheKey } from '@/lib/cache'
import { getGoogleBooksConfig } from '@/lib/google-books-config'
import { throttledFetch } from '@/lib/request-throttle'

export interface GoogleBook {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    description?: string
    imageLinks?: {
      thumbnail?: string
      smallThumbnail?: string
    }
    publishedDate?: string
    pageCount?: number
    categories?: string[]
    averageRating?: number
    ratingsCount?: number
  }
}

export interface GoogleBooksResponse {
  items: GoogleBook[]
  totalItems: number
}

// Enhanced fetch with timeout and retry logic
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = 10000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await throttledFetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Volume-BookReviews/1.0',
        'Accept': 'application/json',
        'Connection': 'keep-alive',
        'Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        ...options.headers
      }
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Retry logic for failed requests with 403 handling
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries: number = 3): Promise<Response> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, 15000) // 15 second timeout
      
      if (response.ok) {
        return response
      }
      
      // Handle 403 Forbidden specifically
      if (response.status === 403) {
        const errorText = await response.text()
        console.error(`Google Books API 403 Error: ${errorText}`)
        
        // Don't retry on 403 - it's likely a quota or permission issue
        throw new Error(`Google Books API access forbidden: ${response.status}`)
      }
      
      // Don't retry on other 4xx errors (client errors)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Google Books API error: ${response.status} ${response.statusText}`)
      }
      
      // Retry on 5xx errors (server errors)
      lastError = new Error(`Google Books API error: ${response.status} ${response.statusText}`)
      
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on abort errors (timeout) or 403 errors
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('forbidden'))) {
        throw error
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) // Max 5 seconds
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// Add delay between requests to prevent rate limiting
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function searchBooks(query: string, maxResults: number = 20): Promise<GoogleBooksResponse> {
  // Check cache first
  const cacheKey = generateCacheKey('search', query, maxResults)
  const cachedResult = booksCache.get<GoogleBooksResponse>(cacheKey)
  
  if (cachedResult) {
    return cachedResult
  }

  const config = getGoogleBooksConfig()
  const baseUrl = `${config.baseUrl}/volumes`
  
  // Sanitize and validate query
  const sanitizedQuery = query.trim().replace(/[^\w\s\-'"]/g, ' ').replace(/\s+/g, ' ')
  
  if (!sanitizedQuery || sanitizedQuery.length < 2) {
    console.warn('Invalid or too short query:', query)
    return { items: [], totalItems: 0 }
  }
  
  const params = new URLSearchParams({
    q: sanitizedQuery,
    maxResults: Math.min(maxResults, 40).toString(), // Google Books API limit
    printType: 'books',
    projection: 'lite', // Reduce response size
    orderBy: 'relevance',
    ...(config.hasApiKey && { key: config.apiKey! })
  })

  try {
    const response = await fetchWithRetry(`${baseUrl}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const result = data || { items: [], totalItems: 0 }
    
    // Ensure items is always an array
    if (!Array.isArray(result.items)) {
      result.items = []
    }
    
    // Cache the result for 30 minutes
    booksCache.set(cacheKey, result, 1800)
    
    return result
  } catch (error) {
    console.error('Error fetching books:', error)
    
    // Return empty result instead of throwing
    return { items: [], totalItems: 0 }
  }
}

export async function getBookById(bookId: string): Promise<GoogleBook> {
  // Check cache first
  const cacheKey = generateCacheKey('book', bookId)
  const cachedResult = booksCache.get<GoogleBook>(cacheKey)
  
  if (cachedResult) {
    return cachedResult
  }

  const config = getGoogleBooksConfig()
  const baseUrl = `${config.baseUrl}/volumes/${encodeURIComponent(bookId)}`
  
  const params = new URLSearchParams({
    ...(config.hasApiKey && { key: config.apiKey! })
  })

  try {
    const response = await fetchWithRetry(`${baseUrl}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Cache the result for 1 hour
    booksCache.set(cacheKey, data, 3600)
    
    return data
  } catch (error) {
    console.error('Error fetching book:', error)
    throw error
  }
}

export async function getTrendingBooks(limit: number = 20): Promise<GoogleBooksResponse> {
  // Check cache first
  const cacheKey = generateCacheKey('trending', limit)
  const cachedResult = booksCache.get<GoogleBooksResponse>(cacheKey)
  
  if (cachedResult) {
    return cachedResult
  }

  // Use safer, more specific queries to avoid 403 errors
  const trendingQueries = [
    'subject:fiction bestseller',
    'subject:biography popular',
    'subject:science new'
  ]

  try {
    const allBooks: GoogleBook[] = []
    const booksPerQuery = Math.ceil(limit / trendingQueries.length)
    
    // Use sequential requests instead of Promise.allSettled to avoid rate limiting
    for (let i = 0; i < trendingQueries.length; i++) {
      const query = trendingQueries[i]
      
      try {
        // Add delay between requests to prevent 403 errors
        if (i > 0) {
          await delay(500) // 500ms delay between requests
        }
        
        console.log(`Fetching trending books for query: "${query}"`)
        const result = await searchBooks(query, booksPerQuery)
        
        if (result.items && result.items.length > 0) {
          allBooks.push(...result.items)
          console.log(`Successfully fetched ${result.items.length} books for "${query}"`)
        }
        
      } catch (error) {
        console.error(`Error fetching trending books for query "${query}":`, error)
        // Continue with next query instead of failing completely
        continue
      }
    }

    // If no books found, try a fallback query
    if (allBooks.length === 0) {
      console.log('No books found from trending queries, trying fallback...')
      try {
        await delay(500)
        const fallbackResult = await searchBooks('popular books', limit)
        if (fallbackResult.items) {
          allBooks.push(...fallbackResult.items)
        }
      } catch (error) {
        console.error('Fallback query also failed:', error)
      }
    }

    // Remove duplicates and sort by rating/popularity
    const uniqueBooks = allBooks
      .filter((book, index, arr) => 
        book && book.id && book.volumeInfo && 
        arr.findIndex(b => b && b.id === book.id) === index
      )
      .sort((a, b) => {
        const aScore = (a.volumeInfo?.averageRating || 0) * (a.volumeInfo?.ratingsCount || 1)
        const bScore = (b.volumeInfo?.averageRating || 0) * (b.volumeInfo?.ratingsCount || 1)
        return bScore - aScore
      })
      .slice(0, limit)

    const result = {
      items: uniqueBooks,
      totalItems: uniqueBooks.length
    }
    
    console.log(`Trending books result: ${result.items.length} unique books`)
    
    // Cache trending books for 2 hours
    booksCache.set(cacheKey, result, 7200)
    
    return result
  } catch (error) {
    console.error('Error fetching trending books:', error)
    
    // Return empty result instead of throwing
    return { items: [], totalItems: 0 }
  }
}