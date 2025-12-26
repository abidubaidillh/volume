import { NextRequest, NextResponse } from 'next/server'
import { searchBooks } from '@/services/books'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || 'javascript'
    const limit = parseInt(searchParams.get('limit') || '5')
    
    console.log(`Testing Google Books API with query: "${query}", limit: ${limit}`)
    
    const result = await searchBooks(query, limit)
    
    return NextResponse.json({
      success: true,
      query,
      limit,
      totalItems: result.totalItems,
      itemsReturned: result.items.length,
      items: result.items.map(book => ({
        id: book.id,
        title: book.volumeInfo.title,
        authors: book.volumeInfo.authors,
        publishedDate: book.volumeInfo.publishedDate
      }))
    })
  } catch (error) {
    console.error('Google Books API test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      query: request.url
    }, { status: 500 })
  }
}