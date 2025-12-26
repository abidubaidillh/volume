import { NextRequest, NextResponse } from 'next/server'
import { getGoogleBooksConfig } from '@/lib/google-books-config'

export async function GET(request: NextRequest) {
  try {
    const config = getGoogleBooksConfig()
    
    return NextResponse.json({
      hasApiKey: config.hasApiKey,
      apiKeyLength: config.apiKey ? config.apiKey.length : 0,
      apiKeyPrefix: config.apiKey ? config.apiKey.substring(0, 10) + '...' : 'Not configured',
      baseUrl: config.baseUrl,
      rateLimit: config.rateLimit
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get API key info' },
      { status: 500 }
    )
  }
}