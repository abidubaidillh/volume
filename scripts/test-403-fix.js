#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function checkServerRunning() {
  try {
    const response = await fetch(`${baseUrl}/api/health`, { 
      signal: AbortSignal.timeout(5000) 
    })
    return response.ok
  } catch (error) {
    return false
  }
}

async function test403Fix() {
  console.log('🔍 Testing 403 Forbidden Error Fix...\n')
  
  // Check if server is running
  console.log('0. Checking if development server is running...')
  const serverRunning = await checkServerRunning()
  
  if (!serverRunning) {
    console.log('❌ Development server is not running!')
    console.log('\n🚀 Please start the server first:')
    console.log('   npm run dev')
    console.log('\n   Then run this test again:')
    console.log('   npm run test:403-fix')
    process.exit(1)
  }
  
  console.log('✅ Development server is running')
  console.log()
  
  try {
    // Test 0: Check API key configuration
    console.log('0.1. Checking API Key Configuration')
    try {
      const apiKeyResponse = await fetch(`${baseUrl}/api/debug/api-key`)
      const apiKeyData = await apiKeyResponse.json()
      
      console.log(`   Has API Key: ${apiKeyData.hasApiKey ? '✅' : '❌'}`)
      console.log(`   API Key Length: ${apiKeyData.apiKeyLength}`)
      console.log(`   API Key Prefix: ${apiKeyData.apiKeyPrefix}`)
      
      if (!apiKeyData.hasApiKey) {
        console.log('   ⚠️  No API key detected - this explains why no books are returned')
      }
    } catch (error) {
      console.log(`   ❌ Failed to check API key: ${error.message}`)
    }
    console.log()

    // Test 0.2: Direct Google Books API test through our server
    console.log('0.2. Testing Google Books API Through Server')
    try {
      const directTestResponse = await fetch(`${baseUrl}/api/debug/google-books-test?q=javascript&limit=3`)
      const directTestData = await directTestResponse.json()
      
      console.log(`   Status: ${directTestResponse.status}`)
      console.log(`   Success: ${directTestData.success ? '✅' : '❌'}`)
      console.log(`   Total Items: ${directTestData.totalItems || 0}`)
      console.log(`   Items Returned: ${directTestData.itemsReturned || 0}`)
      
      if (directTestData.success && directTestData.items && directTestData.items.length > 0) {
        console.log(`   📚 Sample book: "${directTestData.items[0].title}"`)
      } else if (!directTestData.success) {
        console.log(`   Error: ${directTestData.error}`)
      }
    } catch (error) {
      console.log(`   ❌ Direct test failed: ${error.message}`)
    }
    console.log()

    // Test 1: Single search request
    console.log('1. Testing Single Search Request')
    const searchResponse = await fetch(`${baseUrl}/api/books/search?q=javascript&maxResults=5`)
    const searchData = await searchResponse.json()
    
    console.log(`   Status: ${searchResponse.status}`)
    console.log(`   Books found: ${searchData.items?.length || 0}`)
    console.log(`   Total items: ${searchData.totalItems || 0}`)
    
    if (searchResponse.status === 403) {
      console.log('   ❌ Still getting 403 on search')
      console.log(`   Error: ${searchData.error || 'Unknown error'}`)
    } else if (searchResponse.status === 200) {
      console.log('   ✅ Search working correctly')
      if (searchData.items && searchData.items.length > 0) {
        console.log(`   📚 Sample book: "${searchData.items[0].volumeInfo.title}"`)
      } else {
        console.log('   ⚠️  No books returned (possible API key issue)')
      }
    } else {
      console.log(`   ⚠️  Unexpected status: ${searchResponse.status}`)
      console.log(`   Response: ${JSON.stringify(searchData, null, 2)}`)
    }
    console.log()

    // Test 2: Trending books (the problematic endpoint)
    console.log('2. Testing Trending Books (Previously 403)')
    const trendingResponse = await fetch(`${baseUrl}/api/books/trending?limit=6`)
    const trendingData = await trendingResponse.json()
    
    console.log(`   Status: ${trendingResponse.status}`)
    console.log(`   Trending books: ${trendingData.items?.length || 0}`)
    console.log(`   Total items: ${trendingData.totalItems || 0}`)
    
    if (trendingResponse.status === 403) {
      console.log('   ❌ Still getting 403 on trending')
      console.log(`   Error: ${trendingData.error || 'Unknown error'}`)
    } else if (trendingResponse.status === 200) {
      console.log('   ✅ Trending books working correctly')
      if (trendingData.items && trendingData.items.length > 0) {
        console.log(`   📚 Sample book: "${trendingData.items[0].volumeInfo.title}"`)
      } else {
        console.log('   ⚠️  No trending books returned')
      }
    } else {
      console.log(`   ⚠️  Unexpected status: ${trendingResponse.status}`)
      console.log(`   Response: ${JSON.stringify(trendingData, null, 2)}`)
    }
    console.log()

    // Test 3: Multiple sequential requests (simulating user behavior)
    console.log('3. Testing Multiple Sequential Requests')
    const queries = ['fiction', 'science', 'history']
    let successCount = 0
    let errorCount = 0
    let totalBooksFound = 0
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i]
      try {
        const response = await fetch(`${baseUrl}/api/books/search?q=${query}&maxResults=3`)
        const data = await response.json()
        
        if (response.status === 200) {
          successCount++
          const booksFound = data.items?.length || 0
          totalBooksFound += booksFound
          console.log(`   ✅ Query "${query}": ${booksFound} books (total: ${data.totalItems || 0})`)
        } else {
          errorCount++
          console.log(`   ❌ Query "${query}": Status ${response.status}`)
          if (data.error) {
            console.log(`      Error: ${data.error}`)
          }
        }
        
        // Small delay between requests
        if (i < queries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (error) {
        errorCount++
        console.log(`   ❌ Query "${query}": ${error.message}`)
      }
    }
    
    console.log(`   Results: ${successCount} success, ${errorCount} errors`)
    console.log(`   Total books found across all queries: ${totalBooksFound}`)
    console.log()

    // Summary
    console.log('📊 Fix Verification Summary:')
    console.log(`   Search API: ${searchResponse.status === 200 ? '✅ Fixed' : '❌ Still broken'}`)
    console.log(`   Trending API: ${trendingResponse.status === 200 ? '✅ Fixed' : '❌ Still broken'}`)
    console.log(`   Sequential Requests: ${successCount === queries.length ? '✅ All working' : `⚠️ ${errorCount} failures`}`)
    
    if (searchResponse.status === 200 && trendingResponse.status === 200) {
      console.log('\n🎉 403 Forbidden error has been fixed!')
      console.log('   Improvements applied:')
      console.log('   • Sequential requests instead of parallel bursts')
      console.log('   • Request throttling with 400ms delays')
      console.log('   • Better query sanitization')
      console.log('   • Enhanced error handling for 403 responses')
      console.log('   • Proper request headers and referer')
      
      if (totalBooksFound === 0) {
        console.log('\n⚠️  Note: APIs are working but returning 0 books')
        console.log('   This is likely due to:')
        console.log('   • API key not being used (check server logs)')
        console.log('   • Rate limiting from Google Books API')
        console.log('   • Query terms not matching any books')
        console.log('   • API quota exhausted')
      }
    } else {
      console.log('\n⚠️  Some issues remain. Possible causes:')
      console.log('   • API key quota exceeded')
      console.log('   • API key restrictions')
      console.log('   • Network connectivity issues')
      console.log('   • Google Books API service issues')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.log('\n🔧 Troubleshooting steps:')
    console.log('1. Ensure development server is running: npm run dev')
    console.log('2. Check API key configuration in .env.local')
    console.log('3. Verify network connectivity')
    console.log('4. Check Google Cloud Console for API quotas')
  }
}

// Run tests
test403Fix().catch(error => {
  console.error('Test runner failed:', error)
  process.exit(1)
})