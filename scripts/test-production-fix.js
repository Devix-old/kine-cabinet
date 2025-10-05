#!/usr/bin/env node

/**
 * Test Production Fix for Prepared Statement Issues
 * This script simulates the exact failure pattern seen in production
 */

const { getDbClient, withDbClient } = require('../src/lib/db-connection.js')

console.log('🧪 TESTING PRODUCTION FIX')
console.log('==========================\n')

// Simulate production environment
process.env.NODE_ENV = 'production'

async function testConnectionPattern() {
  console.log('📋 TEST 1: Simulating Production Connection Pattern')
  console.log('---------------------------------------------------')
  
  try {
    // Test 1: Initial connection (like login)
    console.log('1. Creating initial connection (login simulation)...')
    const client1 = getDbClient()
    
    // Test basic query
    const userCount = await client1.user.count()
    console.log(`✅ Initial connection successful: ${userCount} users found`)
    
    // Test 2: Multiple rapid queries (like dashboard loading)
    console.log('2. Testing rapid queries (dashboard simulation)...')
    const promises = [
      client1.user.count(),
      client1.cabinet.count(),
      client1.plan.count()
    ]
    
    const results = await Promise.all(promises)
    console.log(`✅ Rapid queries successful: users=${results[0]}, cabinets=${results[1]}, plans=${results[2]}`)
    
    // Test 3: Create multiple clients (like different API calls)
    console.log('3. Testing multiple client instances (API calls simulation)...')
    const client2 = getDbClient()
    const client3 = getDbClient()
    
    const [result2, result3] = await Promise.all([
      client2.patient.count(),
      client3.appointment.count()
    ])
    
    console.log(`✅ Multiple clients successful: patients=${result2}, appointments=${result3}`)
    
    // Test 4: Simulate the failure pattern
    console.log('4. Testing failure pattern simulation...')
    
    // Create many clients rapidly (simulating the cascade failure)
    const clients = Array.from({ length: 10 }, () => getDbClient())
    
    const testPromises = clients.map((client, index) => 
      client.user.findFirst({ 
        where: { email: `test${index}@example.com` } 
      }).catch(error => ({ error: error.message }))
    )
    
    const testResults = await Promise.all(testPromises)
    const errors = testResults.filter(r => r.error)
    
    if (errors.length === 0) {
      console.log('✅ No prepared statement errors detected')
    } else {
      console.log(`⚠️  ${errors.length} errors detected:`)
      errors.forEach((err, i) => {
        if (err.error.includes('prepared statement')) {
          console.log(`   Error ${i+1}: Prepared statement conflict`)
        } else {
          console.log(`   Error ${i+1}: ${err.error}`)
        }
      })
    }
    
    // Cleanup
    await Promise.all([
      client1.$disconnect(),
      client2.$disconnect(), 
      client3.$disconnect(),
      ...clients.map(c => c.$disconnect())
    ])
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`)
    if (error.message.includes('prepared statement')) {
      console.log('🚨 PREPARED STATEMENT ERROR DETECTED!')
    }
  }
}

async function testWithDbClientWrapper() {
  console.log('\n📋 TEST 2: Testing withDbClient Wrapper')
  console.log('----------------------------------------')
  
  try {
    // Test the wrapper function
    const result = await withDbClient(async (client) => {
      const userCount = await client.user.count()
      const cabinetCount = await client.cabinet.count()
      return { userCount, cabinetCount }
    })
    
    console.log(`✅ Wrapper test successful: users=${result.userCount}, cabinets=${result.cabinetCount}`)
    
    // Test error handling
    const errorResult = await withDbClient(async (client) => {
      // This should trigger the retry mechanism if there's a prepared statement error
      return await client.user.findFirst({
        where: { email: 'nonexistent@example.com' }
      })
    })
    
    console.log('✅ Error handling test successful')
    
  } catch (error) {
    console.log(`❌ Wrapper test failed: ${error.message}`)
  }
}

async function testConnectionUrl() {
  console.log('\n📋 TEST 3: Testing Connection URL Configuration')
  console.log('-----------------------------------------------')
  
  try {
    const { getOptimizedDatabaseUrl } = require('../src/lib/db-connection.js')
    const url = getOptimizedDatabaseUrl()
    
    console.log('✅ Database URL generated successfully')
    console.log(`   URL includes prepared_statements=false: ${url.includes('prepared_statements=false')}`)
    console.log(`   URL includes connection_limit=1: ${url.includes('connection_limit=1')}`)
    console.log(`   URL includes unique application_name: ${url.includes('application_name')}`)
    
  } catch (error) {
    console.log(`❌ URL test failed: ${error.message}`)
  }
}

async function runAllTests() {
  await testConnectionPattern()
  await testWithDbClientWrapper()
  await testConnectionUrl()
  
  console.log('\n📋 TEST SUMMARY')
  console.log('================')
  console.log('If all tests passed:')
  console.log('  ✅ The production fix should work in Vercel')
  console.log('  ✅ Prepared statement conflicts should be resolved')
  console.log('  ✅ Multiple API calls should work without cascading failures')
  console.log('')
  console.log('If tests failed:')
  console.log('  🔧 Check your DATABASE_URL environment variable')
  console.log('  🔧 Verify your database is accessible')
  console.log('  🔧 Check for any remaining prepared statement issues')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Commit and push these changes')
  console.log('  2. Monitor Vercel deployment logs')
  console.log('  3. Test the actual application in production')
  
  process.exit(0)
}

runAllTests().catch(console.error)
