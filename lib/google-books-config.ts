/**
 * Google Books API Configuration
 * Validates and manages Google Books API key configuration
 */

export interface GoogleBooksConfig {
  apiKey: string | null
  hasApiKey: boolean
  baseUrl: string
  rateLimit: {
    withKey: number
    withoutKey: number
  }
}

export function getGoogleBooksConfig(): GoogleBooksConfig {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || null
  
  // For now, disable API key usage since Books API is not enabled for this project
  // The API works fine without key but with lower rate limits
  const useApiKey = false // Set to true once Books API is enabled in Google Cloud Console
  
  return {
    apiKey: useApiKey ? apiKey : null,
    hasApiKey: useApiKey && !!apiKey,
    baseUrl: 'https://www.googleapis.com/books/v1',
    rateLimit: {
      withKey: 1000, // requests per day with API key
      withoutKey: 100 // requests per day without API key
    }
  }
}

export function validateApiKey(apiKey: string): boolean {
  // Google API keys typically start with 'AIza' and are 39 characters long
  return apiKey.startsWith('AIza') && apiKey.length === 39
}

export function getApiKeyStatus(): {
  configured: boolean
  valid: boolean
  message: string
  needsApiEnable?: boolean
} {
  const rawApiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || null
  const config = getGoogleBooksConfig()
  
  if (!rawApiKey) {
    return {
      configured: false,
      valid: false,
      message: 'Google Books API key not configured. Using limited rate limits.'
    }
  }
  
  const isValidFormat = validateApiKey(rawApiKey)
  
  if (!isValidFormat) {
    return {
      configured: true,
      valid: false,
      message: 'Google Books API key format appears invalid. Please check your key.'
    }
  }
  
  if (!config.hasApiKey) {
    return {
      configured: true,
      valid: true,
      message: 'API key available but Books API not enabled in Google Cloud Console. Using without key.',
      needsApiEnable: true
    }
  }
  
  return {
    configured: true,
    valid: true,
    message: 'Google Books API key configured and valid.'
  }
}

// Log API key status on module load (development only)
if (process.env.NODE_ENV === 'development') {
  const status = getApiKeyStatus()
  console.log(`📚 Google Books API: ${status.message}`)
}