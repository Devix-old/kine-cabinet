#!/usr/bin/env node

/**
 * Database Performance & Connection Debugging
 * Deep dive into database issues that could cause 500 errors
 */

const { PrismaClient } = require('@prisma/client')
require('dotenv').config({ path: '.env.local' })

console.log('🔍 DATABASE PERFORMANCE & CONNECTION DEBUG')
console.log('===========================================\n')

// Configure Prisma with detailed logging
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'info' }
  ],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Track query performance
const queryTimes = []
const errorLog = []

// Listen to Prisma events
prisma.$on('query', (e) => {
  queryTimes.push({
    query: e.query,
    params: e.params,
    duration: e.duration,
    timestamp: new Date()
  })
})

prisma.$on('error', (e) => {
  errorLog.push({
    error: e.message,
    timestamp: new Date()
  })
})

// Test 1: Connection Pool Analysis
console.log('📋 TEST 1: Connection Pool Analysis')
console.log('------------------------------------')
try {
  const startTime = Date.now()
  
  // Test multiple concurrent connections
  const concurrentQueries = Array.from({ length: 10 }, () => 
    prisma.user.count()
  )
  
  await Promise.all(concurrentQueries)
  
  const endTime = Date.now()
  const totalTime = endTime - startTime
  
  console.log(`✅ Concurrent queries completed in ${totalTime}ms`)
  console.log(`✅ Average query time: ${totalTime / 10}ms`)
  
  if (totalTime > 5000) {
    console.log('⚠️  Slow concurrent performance detected')
  }
  
} catch (error) {
  console.log(`❌ Connection pool test failed: ${error.message}`)
}
console.log('')

// Test 2: Transaction Performance
console.log('📋 TEST 2: Transaction Performance')
console.log('----------------------------------')
try {
  const startTime = Date.now()
  
  // Test transaction with multiple operations
  await prisma.$transaction(async (tx) => {
    // Simulate registration transaction
    await tx.cabinet.count()
    await tx.user.count()
    await tx.plan.count()
    await tx.subscription.count()
  })
  
  const endTime = Date.now()
  const transactionTime = endTime - startTime
  
  console.log(`✅ Transaction completed in ${transactionTime}ms`)
  
  if (transactionTime > 1000) {
    console.log('⚠️  Slow transaction performance')
  }
  
} catch (error) {
  console.log(`❌ Transaction test failed: ${error.message}`)
}
console.log('')

// Test 3: Database Lock Detection
console.log('📋 TEST 3: Database Lock Detection')
console.log('----------------------------------')
try {
  const startTime = Date.now()
  
  // Test for potential deadlocks
  const lockTest = async () => {
    return prisma.$transaction(async (tx) => {
      // Long-running query that might cause locks
      await tx.user.findMany({
        include: {
          cabinet: true
        }
      })
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return tx.cabinet.findMany()
    })
  }
  
  // Run multiple transactions concurrently
  const lockTests = Array.from({ length: 5 }, () => lockTest())
  await Promise.allSettled(lockTests)
  
  const endTime = Date.now()
  console.log(`✅ Lock detection test completed in ${endTime - startTime}ms`)
  
} catch (error) {
  console.log(`❌ Lock detection test failed: ${error.message}`)
  if (error.message.includes('deadlock') || error.message.includes('lock')) {
    console.log('🚨 POTENTIAL DEADLOCK DETECTED!')
  }
}
console.log('')

// Test 4: Memory Usage Analysis
console.log('📋 TEST 4: Memory Usage Analysis')
console.log('--------------------------------')
try {
  const initialMemory = process.memoryUsage()
  
  // Perform memory-intensive operations
  const largeQuery = await prisma.user.findMany({
    include: {
      cabinet: {
        include: {
          patients: {
            take: 10
          }
        }
      }
    },
    take: 100
  })
  
  const finalMemory = process.memoryUsage()
  const memoryDiff = finalMemory.heapUsed - initialMemory.heapUsed
  
  console.log(`✅ Memory test completed`)
  console.log(`   Initial memory: ${Math.round(initialMemory.heapUsed / 1024 / 1024)}MB`)
  console.log(`   Final memory: ${Math.round(finalMemory.heapUsed / 1024 / 1024)}MB`)
  console.log(`   Memory difference: ${Math.round(memoryDiff / 1024 / 1024)}MB`)
  
  if (memoryDiff > 50 * 1024 * 1024) { // 50MB
    console.log('⚠️  High memory usage detected')
  }
  
} catch (error) {
  console.log(`❌ Memory analysis failed: ${error.message}`)
}
console.log('')

// Test 5: Query Optimization Check
console.log('📋 TEST 5: Query Optimization Check')
console.log('-----------------------------------')
try {
  // Reset query times
  queryTimes.length = 0
  
  // Test queries that might be used in registration
  await prisma.user.findFirst({
    where: { email: 'test@example.com' }
  })
  
  await prisma.cabinet.findUnique({
    where: { nom: 'test-cabinet' }
  })
  
  await prisma.plan.findFirst({
    where: { name: 'trial' }
  })
  
  console.log(`✅ Query optimization test completed`)
  console.log(`   Total queries executed: ${queryTimes.length}`)
  
  // Analyze query performance
  const slowQueries = queryTimes.filter(q => q.duration > 100)
  if (slowQueries.length > 0) {
    console.log(`⚠️  ${slowQueries.length} slow queries detected (>100ms)`)
    slowQueries.forEach(q => {
      console.log(`   Slow query: ${q.query.substring(0, 100)}... (${q.duration}ms)`)
    })
  } else {
    console.log('✅ All queries performed well (<100ms)')
  }
  
} catch (error) {
  console.log(`❌ Query optimization test failed: ${error.message}`)
}
console.log('')

// Test 6: Connection String Analysis
console.log('📋 TEST 6: Connection String Analysis')
console.log('-------------------------------------')
try {
  const dbUrl = process.env.DATABASE_URL
  
  if (!dbUrl) {
    console.log('❌ DATABASE_URL not found in environment')
  } else {
    console.log('✅ DATABASE_URL found')
    
    // Parse connection string for analysis
    const url = new URL(dbUrl)
    
    console.log(`   Host: ${url.hostname}`)
    console.log(`   Port: ${url.port || 'default'}`)
    console.log(`   Database: ${url.pathname.slice(1)}`)
    console.log(`   SSL: ${url.searchParams.get('sslmode') || 'not specified'}`)
    
    // Check for potential issues
    const warnings = []
    
    if (url.searchParams.get('sslmode') === 'require' && url.hostname === 'localhost') {
      warnings.push('SSL required for localhost - might cause issues')
    }
    
    if (!url.searchParams.get('connection_limit')) {
      warnings.push('No connection limit specified - might exhaust pool')
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  Connection string warnings:')
      warnings.forEach(warning => console.log(`   - ${warning}`))
    } else {
      console.log('✅ Connection string looks good')
    }
  }
  
} catch (error) {
  console.log(`❌ Connection string analysis failed: ${error.message}`)
}
console.log('')

// Test 7: Error Log Analysis
console.log('📋 TEST 7: Error Log Analysis')
console.log('-----------------------------')
try {
  // Simulate some operations that might generate errors
  await prisma.user.findUnique({
    where: { email: 'nonexistent@example.com' }
  }).catch(() => {}) // Ignore not found error
  
  await prisma.$queryRaw`SELECT * FROM nonexistent_table`.catch(() => {}) // Ignore error
  
  console.log(`✅ Error simulation completed`)
  console.log(`   Errors logged: ${errorLog.length}`)
  
  if (errorLog.length > 0) {
    console.log('⚠️  Errors detected during testing:')
    errorLog.forEach(error => {
      console.log(`   - ${error.error} (${error.timestamp})`)
    })
  } else {
    console.log('✅ No errors detected')
  }
  
} catch (error) {
  console.log(`❌ Error log analysis failed: ${error.message}`)
}
console.log('')

// Performance Summary
console.log('📋 PERFORMANCE SUMMARY')
console.log('======================')
console.log(`Total queries executed: ${queryTimes.length}`)
console.log(`Total errors logged: ${errorLog.length}`)

if (queryTimes.length > 0) {
  const avgQueryTime = queryTimes.reduce((sum, q) => sum + q.duration, 0) / queryTimes.length
  const maxQueryTime = Math.max(...queryTimes.map(q => q.duration))
  
  console.log(`Average query time: ${avgQueryTime.toFixed(2)}ms`)
  console.log(`Maximum query time: ${maxQueryTime}ms`)
  
  if (avgQueryTime > 50) {
    console.log('⚠️  Average query time is high - consider optimization')
  }
  
  if (maxQueryTime > 500) {
    console.log('⚠️  Some queries are very slow - check for missing indexes')
  }
}

// Recommendations
console.log('\n📋 RECOMMENDATIONS')
console.log('==================')
console.log('Based on the test results:')
console.log('')
console.log('If performance is good:')
console.log('  ✅ Database performance is healthy')
console.log('  ✅ 500 errors might be caused by:')
console.log('     - Application-level issues')
console.log('     - Network timeouts')
console.log('     - Race conditions in business logic')
console.log('')
console.log('If performance is poor:')
console.log('  🔧 Add database indexes for frequently queried fields')
console.log('  🔧 Optimize Prisma queries (avoid N+1 problems)')
console.log('  🔧 Increase connection pool size if needed')
console.log('  🔧 Consider database connection pooling (PgBouncer)')
console.log('')
console.log('For 500 error debugging:')
console.log('  1. Enable Prisma query logging in production')
console.log('  2. Monitor database connection count')
console.log('  3. Check for deadlocks in application logs')
console.log('  4. Implement retry logic for transient failures')

// Cleanup
await prisma.$disconnect()
console.log('\n✅ Database performance debugging completed')
