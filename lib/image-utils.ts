/**
 * Normalizes Google Books image URLs to use HTTPS
 * Google Books API sometimes returns HTTP URLs which need to be converted to HTTPS
 */
export function normalizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  // Convert HTTP to HTTPS for Google Books URLs
  if (url.startsWith('http://books.google')) {
    return url.replace('http:', 'https:')
  }
  
  if (url.startsWith('http://books.googleusercontent')) {
    return url.replace('http:', 'https:')
  }
  
  return url
}

/**
 * Gets the best available book cover URL from Google Books volumeInfo
 */
export function getBookCoverUrl(volumeInfo: {
  imageLinks?: {
    thumbnail?: string
    smallThumbnail?: string
  }
}): string {
  const thumbnail = normalizeImageUrl(volumeInfo.imageLinks?.thumbnail)
  const smallThumbnail = normalizeImageUrl(volumeInfo.imageLinks?.smallThumbnail)
  
  return thumbnail || smallThumbnail || '/placeholder-book.svg'
}