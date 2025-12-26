#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:3000'

async function checkServer() {
  console.log('🔍 Checking Development Server Status...\n')
  
  try {
    console.log(`Attempting to connect to: ${baseUrl}`)
    
    const response = await fetch(`${baseUrl}/api/health`, {
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Development server is running!')
      console.log(`   Status: ${data.status}`)
      console.log(`   Timestamp: ${data.timestamp}`)
      
      if (data.services) {
        console.log('\n📊 Service Status:')
        Object.entries(data.services).forEach(([service, info]) => {
          console.log(`   ${service}: ${info.status}`)
        })
      }
      
      console.log('\n🚀 You can now run the 403 fix test:')
      console.log('   npm run test:403-fix')
      
    } else {
      console.log(`❌ Server responded with status: ${response.status}`)
      console.log('   The server might be starting up or having issues.')
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('❌ Connection timeout - server is not responding')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - server is not running')
    } else {
      console.log(`❌ Connection failed: ${error.message}`)
    }
    
    console.log('\n🚀 To start the development server:')
    console.log('   npm run dev')
    console.log('\n   Then wait for the "Ready" message before running tests.')
  }
}

checkServer().catch(error => {
  console.error('Health check failed:', error.message)
  process.exit(1)
})