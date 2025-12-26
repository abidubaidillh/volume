#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function testAuthEndpoint(endpoint, method = 'GET', body = null) {
  try {
    console.log(`Testing ${method} ${endpoint}...`)
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options)
    const data = await response.json()
    
    console.log(`   Status: ${response.status}`)
    console.log(`   Response:`, JSON.stringify(data, null, 2))
    
    return { status: response.status, data }
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`)
    return { error: error.message }
  }
}

async function runAuthTests() {
  console.log('🔐 Testing Authentication System...\n')
  
  // Test 1: Health check
  console.log('1. Health Check')
  await testAuthEndpoint('/api/health')
  console.log()
  
  // Test 2: Profile endpoint without auth (should fail)
  console.log('2. Profile Access (No Auth - Should Fail)')
  await testAuthEndpoint('/api/auth/profile')
  console.log()
  
  // Test 3: Dashboard stats without auth (should fail)
  console.log('3. Dashboard Stats (No Auth - Should Fail)')
  await testAuthEndpoint('/api/dashboard/stats')
  console.log()
  
  // Test 4: Auth callback with no code (should redirect)
  console.log('4. Auth Callback (No Code)')
  await testAuthEndpoint('/auth/callback')
  console.log()
  
  // Test 5: Books search (should work without auth)
  console.log('5. Books Search (Public - Should Work)')
  await testAuthEndpoint('/api/books/search?q=javascript')
  console.log()
  
  // Test 6: Trending books (should work without auth)
  console.log('6. Trending Books (Public - Should Work)')
  await testAuthEndpoint('/api/books/trending?limit=5')
  console.log()
  
  console.log('✅ Auth system tests completed!')
  console.log('\n📝 Notes:')
  console.log('- Endpoints requiring auth should return 401/400 status')
  console.log('- Public endpoints should return 200 status')
  console.log('- To test full auth flow, use the web interface')
}

// Run tests
runAuthTests().catch(error => {
  console.error('Auth test runner failed:', error)
  process.exit(1)
})