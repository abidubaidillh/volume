#!/usr/bin/env node

const API_KEY = 'AIzaSyC__t7WFWj-W53Nh8ZBW-6Z2OX0mm6vBSU'

async function testDirectApiKey() {
  console.log('🔍 Testing Google Books API Key Directly...\n')
  
  const tests = [
    {
      name: 'Simple search with API key',
      url: `https://www.googleapis.com/books/v1/volumes?q=javascript&maxResults=3&key=${API_KEY}`
    },
    {
      name: 'Simple search without API key',
      url: 'https://www.googleapis.com/books/v1/volumes?q=javascript&maxResults=3'
    },
    {
      name: 'Search with different query',
      url: `https://www.googleapis.com/books/v1/volumes?q=fiction&maxResults=3&key=${API_KEY}`
    },
    {
      name: 'Search with subject filter',
      url: `https://www.googleapis.com/books/v1/volumes?q=subject:fiction&maxResults=3&key=${API_KEY}`
    }
  ]
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`)
    
    try {
      const response = await fetch(test.url, {
        headers: {
          'User-Agent': 'Volume-BookReviews/1.0',
          'Accept': 'application/json',
          'Referer': 'http://localhost:3000'
        }
      })
      
      console.log(`  Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`  Total Items: ${data.totalItems || 0}`)
        console.log(`  Items Returned: ${data.items?.length || 0}`)
        
        if (data.items && data.items.length > 0) {
          console.log(`  Sample: "${data.items[0].volumeInfo.title}"`)
        }
      } else {
        const errorText = await response.text()
        console.log(`  Error: ${errorText.substring(0, 200)}...`)
      }
      
    } catch (error) {
      console.log(`  Error: ${error.message}`)
    }
    
    console.log()
    
    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

testDirectApiKey().catch(console.error)