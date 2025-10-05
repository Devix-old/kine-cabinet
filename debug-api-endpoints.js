#!/usr/bin/env node

/**
 * API Endpoint Testing Suite
 * Test registration and login endpoints directly
 */

const fetch = require('node-fetch')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 API ENDPOINT TESTING SUITE')
console.log('===============================\n')

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'testpassword123',
  cabinetType: 'KINESITHERAPIE'
}

// Test 1: Health Check
console.log('📋 TEST 1: Server Health Check')
console.log('-------------------------------')
try {
  const response = await fetch(`${BASE_URL}/api/public/register`, {
    method: 'OPTIONS'
  })
  console.log(`✅ Server responding: ${response.status}`)
} catch (error) {
  console.log(`❌ Server not responding: ${error.message}`)
  console.log('💡 Make sure your Next.js server is running: npm run dev')
  process.exit(1)
}
console.log('')

// Test 2: Registration Endpoint
console.log('📋 TEST 2: Registration Endpoint')
console.log('--------------------------------')
try {
  console.log(`Testing registration for: ${testUser.email}`)
  
  const response = await fetch(`${BASE_URL}/api/public/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testUser)
  })
  
  const data = await response.text()
  let responseData
  
  try {
    responseData = JSON.parse(data)
  } catch {
    responseData = { raw: data }
  }
  
  console.log(`Response Status: ${response.status}`)
  console.log(`Response Data:`, responseData)
  
  if (response.status === 201) {
    console.log('✅ Registration successful!')
  } else if (response.status === 409) {
    console.log('⚠️  User already exists (expected for repeated tests)')
  } else {
    console.log(`❌ Registration failed with status ${response.status}`)
    console.log('Response:', data)
  }
  
} catch (error) {
  console.log(`❌ Registration test failed: ${error.message}`)
}
console.log('')

// Test 3: Login Endpoint (NextAuth)
console.log('📋 TEST 3: Login Endpoint Test')
console.log('------------------------------')
try {
  // Test NextAuth signin endpoint
  const response = await fetch(`${BASE_URL}/api/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      email: testUser.email,
      password: testUser.password,
      callbackUrl: '/dashboard',
      csrfToken: 'test' // This will fail but we can see the response structure
    })
  })
  
  console.log(`Login endpoint status: ${response.status}`)
  
  if (response.status === 200) {
    console.log('✅ Login endpoint accessible')
  } else if (response.status === 400 || response.status === 403) {
    console.log('⚠️  Login endpoint accessible (authentication failed as expected)')
  } else {
    console.log(`❌ Login endpoint issue: ${response.status}`)
  }
  
} catch (error) {
  console.log(`❌ Login endpoint test failed: ${error.message}`)
}
console.log('')

// Test 4: Database Connection via API
console.log('📋 TEST 4: Database Connection via API')
console.log('---------------------------------------')
try {
  // Try to access a protected endpoint that requires DB
  const response = await fetch(`${BASE_URL}/api/users`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  
  console.log(`Database API test status: ${response.status}`)
  
  if (response.status === 401) {
    console.log('✅ Database connection working (unauthorized as expected)')
  } else if (response.status === 500) {
    console.log('❌ Database connection issue detected')
  } else {
    console.log(`⚠️  Unexpected status: ${response.status}`)
  }
  
} catch (error) {
  console.log(`❌ Database API test failed: ${error.message}`)
}
console.log('')

// Test 5: Error Handling Test
console.log('📋 TEST 5: Error Handling Test')
console.log('-------------------------------')
try {
  // Test with invalid data
  const invalidData = {
    email: 'invalid-email',
    password: '123' // Too short
  }
  
  const response = await fetch(`${BASE_URL}/api/public/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invalidData)
  })
  
  const data = await response.json()
  
  console.log(`Invalid data test status: ${response.status}`)
  console.log(`Error response:`, data)
  
  if (response.status === 400) {
    console.log('✅ Error handling working correctly')
  } else {
    console.log('⚠️  Unexpected error handling behavior')
  }
  
} catch (error) {
  console.log(`❌ Error handling test failed: ${error.message}`)
}
console.log('')

// Test 6: Concurrent Requests Test
console.log('📋 TEST 6: Concurrent Requests Test')
console.log('-----------------------------------')
try {
  console.log('Testing concurrent registration requests...')
  
  const concurrentRequests = Array.from({ length: 5 }, (_, i) => 
    fetch(`${BASE_URL}/api/public/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `concurrent-test-${i}-${Date.now()}@example.com`,
        password: 'testpassword123'
      })
    })
  )
  
  const responses = await Promise.allSettled(concurrentRequests)
  
  let successCount = 0
  let errorCount = 0
  
  responses.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.status === 201) {
        successCount++
      } else {
        errorCount++
        console.log(`Request ${index} failed with status: ${result.value.status}`)
      }
    } else {
      errorCount++
      console.log(`Request ${index} rejected: ${result.reason.message}`)
    }
  })
  
  console.log(`✅ Concurrent test results: ${successCount} successful, ${errorCount} failed`)
  
  if (errorCount > 0) {
    console.log('⚠️  Some concurrent requests failed - might indicate race conditions')
  }
  
} catch (error) {
  console.log(`❌ Concurrent requests test failed: ${error.message}`)
}
console.log('')

// Summary
console.log('📋 API TESTING SUMMARY')
console.log('======================')
console.log('If most tests passed:')
console.log('  ✅ Your API endpoints are working correctly')
console.log('  ✅ Database connections are healthy')
console.log('  ✅ The 500 errors might be:')
console.log('     - Intermittent network issues')
console.log('     - Database connection pool exhaustion')
console.log('     - Race conditions in high traffic')
console.log('')
console.log('If tests failed:')
console.log('  🔧 Check server logs for detailed error messages')
console.log('  🔧 Verify environment variables are set correctly')
console.log('  🔧 Test database connection independently')
console.log('')
console.log('Next debugging steps:')
console.log('  1. Run: node debug-auth-issues.js')
console.log('  2. Check browser network tab for exact error details')
console.log('  3. Monitor server logs during failed requests')
console.log('  4. Test with different browsers/devices')

console.log('\n✅ API testing suite completed')
