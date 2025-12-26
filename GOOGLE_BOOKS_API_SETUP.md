# Google Books API Setup & Error Fix

## Error Fixed
`TypeError: fetch failed (ECONNRESET)` in Google Books API integration

## Root Causes & Solutions

### 1. Connection Timeout
- **Problem**: Default fetch timeout too short for Google Books API
- **Solution**: Added 15-second timeout with AbortController

### 2. Rate Limiting
- **Problem**: Multiple concurrent requests causing connection drops
- **Solution**: Implemented exponential backoff and retry logic

### 3. Missing Error Handling
- **Problem**: Unhandled network failures crashing the API
- **Solution**: Comprehensive try/catch with graceful fallbacks

## API Key Setup (Recommended)

### Why You Need an API Key
- **Higher Rate Limits**: 1,000 requests/day (free) vs 100/day (no key)
- **Better Reliability**: Dedicated quota reduces ECONNRESET errors
- **Faster Response**: Priority processing for authenticated requests

### How to Get Google Books API Key

1. **Go to Google Cloud Console**
   ```
   https://console.cloud.google.com/
   ```

2. **Create/Select Project**
   - Create new project or select existing
   - Enable "Books API" in API Library

3. **Create Credentials**
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Copy the generated API key

4. **Restrict API Key (Security)**
   - Click on your API key
   - Under "API restrictions" → Select "Books API"
   - Under "Application restrictions" → Add your domain

5. **Add to Environment Variables**
   ```bash
   # .env.local
   NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_actual_api_key_here
   ```

### Environment Variables Setup

```bash
# Required for Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional but recommended for Google Books
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_google_books_api_key

# Site URL for OAuth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Implementation Features

### ✅ Enhanced Fetch with Timeout
```typescript
async function fetchWithTimeout(url: string, timeout: number = 10000)
```

### ✅ Retry Logic with Exponential Backoff
```typescript
async function fetchWithRetry(url: string, maxRetries: number = 3)
```

### ✅ Graceful Error Handling
- Returns empty arrays instead of throwing errors
- Specific error messages for different failure types
- Proper HTTP status codes

### ✅ Improved Caching
- 30 minutes for search results
- 2 hours for trending books
- 1 hour for individual books

### ✅ Rate Limiting Protection
- Built-in rate limiting per IP
- Proper headers for client feedback

## Testing the Fix

```bash
# Test the trending books endpoint
curl http://localhost:3000/api/books/trending

# Test with limit parameter
curl http://localhost:3000/api/books/trending?limit=10

# Test search endpoint
curl "http://localhost:3000/api/books/search?q=javascript"
```

## Monitoring

The enhanced implementation includes:
- Detailed error logging with context
- Timeout tracking
- Cache hit/miss metrics
- Rate limit monitoring

## Performance Improvements

1. **Parallel Requests**: Uses `Promise.allSettled()` for trending books
2. **Smart Caching**: Different cache durations based on data type
3. **Connection Reuse**: Proper headers for keep-alive connections
4. **Graceful Degradation**: Returns partial results on partial failures

The ECONNRESET error should now be resolved with proper timeout handling, retry logic, and graceful error recovery! 🚀