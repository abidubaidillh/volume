#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function checkAuthState() {
  console.log('🔍 Debugging Auth State...\n')
  
  try {
    // Test 1: Check if server can detect auth
    console.log('1. Testing Server-Side Auth Detection')
    const response = await fetch(`${baseUrl}/api/health`)
    console.log(`   Health check: ${response.status}`)
    
    // Test 2: Check auth endpoints
    console.log('\n2. Testing Auth Endpoints')
    const authTests = [
      '/api/dashboard/stats',
      '/api/dashboard/activity', 
      '/api/auth/profile'
    ]
    
    for (const endpoint of authTests) {
      const res = await fetch(`${baseUrl}${endpoint}`)
      console.log(`   ${endpoint}: ${res.status} (${res.status === 401 ? 'Correctly protected' : 'Check auth'})`)
    }
    
    // Test 3: Check public endpoints
    console.log('\n3. Testing Public Endpoints')
    const publicTests = [
      '/api/books/search?q=test',
      '/api/books/trending'
    ]
    
    for (const endpoint of publicTests) {
      const res = await fetch(`${baseUrl}${endpoint}`)
      console.log(`   ${endpoint}: ${res.status} (${res.status === 200 ? 'Working' : 'Issue detected'})`)
    }
    
    console.log('\n📋 Debug Instructions:')
    console.log('1. Open browser dev tools (F12)')
    console.log('2. Go to Console tab')
    console.log('3. Login and check for "HomePage - User:" logs')
    console.log('4. Check Network tab for auth requests')
    console.log('5. Check Application > Local Storage for session data')
    
    console.log('\n🔧 If still showing "Join Volume Today":')
    console.log('- Clear browser cache and cookies')
    console.log('- Check browser console for errors')
    console.log('- Verify Supabase environment variables')
    console.log('- Try hard refresh (Ctrl+Shift+R)')
    
  } catch (error) {
    console.error('Debug failed:', error.message)
  }
}

checkAuthState()