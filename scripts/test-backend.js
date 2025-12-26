#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function testEndpoint(endpoint, expectedStatus = 200) {
  try {
    console.log(`Testing ${endpoint}...`)
    const response = await fetch(`${baseUrl}${endpoint}`)
    const data = await response.json()
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${endpoint} - Status: ${response.status}`)
      return true
    } else {
      console.log(`❌ ${endpoint} - Expected: ${expectedStatus}, Got: ${response.status}`)
      console.log(`   Response:`, data)
      return false
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`)
    return false
  }
}

async function runTests() {
  console.log('🧪 Testing Backend Endpoints...\n')
  
  const tests = [
    // Health check
    { endpoint: '/api/health', status: 200 },
    
    // Books API (should require query parameter)
    { endpoint: '/api/books/search', status: 400 },
    { endpoint: '/api/books/search?q=javascript', status: 200 },
    { endpoint: '/api/books/trending', status: 200 },
    
    // Dashboard API (should require authentication)
    { endpoint: '/api/dashboard/stats', status: 400 },
    { endpoint: '/api/dashboard/activity', status: 400 },
    
    // User API (should require authentication)
    { endpoint: '/api/user/goals', status: 400 }
  ]
  
  let passed = 0
  let total = tests.length
  
  for (const test of tests) {
    const success = await testEndpoint(test.endpoint, test.status)
    if (success) passed++
    console.log() // Empty line for readability
  }
  
  console.log(`\n📊 Test Results: ${passed}/${total} tests passed`)
  
  if (passed === total) {
    console.log('🎉 All tests passed! Backend is working correctly.')
    process.exit(0)
  } else {
    console.log('⚠️  Some tests failed. Please check the backend configuration.')
    process.exit(1)
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test runner failed:', error)
  process.exit(1)
})