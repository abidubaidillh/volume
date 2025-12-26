#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function testGoogleBooksAPI() {
  console.log('🔍 Testing Google Books API Integration...\n')
  
  try {
    // Test 1: Check environment variable
    console.log('1. Checking Environment Variables')
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
    if (apiKey) {
      console.log(`   ✅ API Key configured: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`)
    } else {
      console.log('   ⚠️  API Key not found in environment')
    }
    console.log()

    // Test 2: Test search endpoint
    console.log('2. Testing Books Search API')
    const searchResponse = await fetch(`${baseUrl}/api/books/search?q=javascript&maxResults=5`)
    const searchData = await searchResponse.json()
    
    console.log(`   Status: ${searchResponse.status}`)
    console.log(`   Books found: ${searchData.items?.length || 0}`)
    
    if (searchData.items && searchData.items.length > 0) {
      console.log(`   ✅ First book: "${searchData.items[0].volumeInfo.title}"`)
    }
    console.log()

    // Test 3: Test trending books endpoint
    console.log('3. Testing Trending Books API')
    const trendingResponse = await fetch(`${baseUrl}/api/books/trending?limit=5`)
    const trendingData = await trendingResponse.json()
    
    console.log(`   Status: ${trendingResponse.status}`)
    console.log(`   Trending books: ${trendingData.items?.length || 0}`)
    
    if (trendingData.items && trendingData.items.length > 0) {
      console.log(`   ✅ First trending: "${trendingData.items[0].volumeInfo.title}"`)
    }
    console.log()

    // Test 4: Direct Google Books API test
    console.log('4. Testing Direct Google Books API')
    const directApiUrl = `https://www.googleapis.com/books/v1/volumes?q=test&maxResults=1&key=${apiKey || ''}`
    
    try {
      const directResponse = await fetch(directApiUrl)
      const directData = await directResponse.json()
      
      console.log(`   Status: ${directResponse.status}`)
      
      if (directResponse.ok && directData.items) {
        console.log(`   ✅ Direct API working: Found ${directData.totalItems} books`)
      } else if (directData.error) {
        console.log(`   ❌ API Error: ${directData.error.message}`)
      }
    } catch (error) {
      console.log(`   ❌ Direct API failed: ${error.message}`)
    }
    console.log()

    // Summary
    console.log('📊 Test Summary:')
    console.log(`   API Key: ${apiKey ? '✅ Configured' : '❌ Missing'}`)
    console.log(`   Search API: ${searchResponse.status === 200 ? '✅ Working' : '❌ Failed'}`)
    console.log(`   Trending API: ${trendingResponse.status === 200 ? '✅ Working' : '❌ Failed'}`)
    
    if (apiKey) {
      console.log('\n🎉 Google Books API is properly configured!')
      console.log('   Benefits:')
      console.log('   • Higher rate limits (1,000 requests/day)')
      console.log('   • Better reliability and performance')
      console.log('   • Reduced ECONNRESET errors')
    } else {
      console.log('\n⚠️  Consider adding Google Books API key for better performance')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run tests
testGoogleBooksAPI().catch(error => {
  console.error('Test runner failed:', error)
  process.exit(1)
})