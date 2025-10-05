#!/usr/bin/env node

/**
 * Comprehensive Authentication & Database Debugging Suite
 * Run this to systematically test and debug 500 errors in registration/login
 */

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
require('dotenv').config({ path: '.env.local' })

const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'],
})

console.log('🔍 KINE CABINET - Authentication Debug Suite')
console.log('===============================================\n')

// Test 1: Environment Variables
console.log('📋 TEST 1: Environment Variables')
console.log('----------------------------------')
const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
]

let envVarsOk = true
requiredEnvVars.forEach(varName => {
  const value = process.env[varName]
  if (!value) {
    console.log(`❌ ${varName}: MISSING`)
    envVarsOk = false
  } else {
    const displayValue = varName.includes('SECRET') || varName.includes('URL') 
      ? value.substring(0, 20) + '...' 
      : value
    console.log(`✅ ${varName}: ${displayValue}`)
  }
})

if (!envVarsOk) {
  console.log('\n🚨 CRITICAL: Missing environment variables!')
  console.log('Create .env.local with required variables')
  process.exit(1)
}
console.log('✅ Environment variables OK\n')

// Test 2: Database Connection
console.log('📋 TEST 2: Database Connection')
console.log('-------------------------------')
try {
  await prisma.$connect()
  console.log('✅ Database connection successful')
  
  // Test basic query
  const userCount = await prisma.user.count()
  console.log(`✅ Database query test successful (${userCount} users found)`)
} catch (error) {
  console.log('❌ Database connection failed:', error.message)
  process.exit(1)
}
console.log('')

// Test 3: Database Schema
console.log('📋 TEST 3: Database Schema Validation')
console.log('--------------------------------------')
try {
  // Check if all required tables exist
  const tables = ['users', 'cabinets', 'plans', 'subscriptions']
  
  for (const table of tables) {
    try {
      await prisma.$queryRaw`SELECT 1 FROM ${prisma._runtimeDataModel.tables[table] || table} LIMIT 1`
      console.log(`✅ Table ${table}: exists`)
    } catch (error) {
      console.log(`❌ Table ${table}: missing or error - ${error.message}`)
    }
  }
} catch (error) {
  console.log('❌ Schema validation failed:', error.message)
}
console.log('')

// Test 4: Trial Plan Check
console.log('📋 TEST 4: Trial Plan Configuration')
console.log('------------------------------------')
try {
  const trialPlan = await prisma.plan.findFirst({
    where: { name: 'trial' }
  })
  
  if (!trialPlan) {
    console.log('❌ Trial plan not found! This will cause registration to fail.')
    console.log('💡 Run: npm run db:seed to create trial plan')
  } else {
    console.log('✅ Trial plan found:', {
      id: trialPlan.id,
      name: trialPlan.name,
      price: trialPlan.price,
      maxPatients: trialPlan.maxPatients,
      isActive: trialPlan.isActive
    })
  }
} catch (error) {
  console.log('❌ Trial plan check failed:', error.message)
}
console.log('')

// Test 5: Registration API Simulation
console.log('📋 TEST 5: Registration API Simulation')
console.log('---------------------------------------')
try {
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  
  console.log(`Testing registration for: ${testEmail}`)
  
  // Check if user exists
  const existingUser = await prisma.user.findFirst({ 
    where: { email: testEmail } 
  })
  
  if (existingUser) {
    console.log('⚠️  Test user already exists, skipping...')
  } else {
    // Test password hashing
    const hashedPassword = await bcrypt.hash(testPassword, 10)
    console.log('✅ Password hashing successful')
    
    // Test cabinet name generation
    const generateTempName = () => `Cabinet Temp ${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    let finalCabinetName = generateTempName()
    while (await prisma.cabinet.findUnique({ where: { nom: finalCabinetName } })) {
      finalCabinetName = generateTempName()
    }
    console.log(`✅ Cabinet name generation successful: ${finalCabinetName}`)
    
    // Test transaction (without committing)
    await prisma.$transaction(async (tx) => {
      const cabinet = await tx.cabinet.create({
        data: {
          nom: finalCabinetName,
          type: 'KINESITHERAPIE',
          specialites: [],
          adresse: null,
          telephone: null,
          email: testEmail,
          siret: null,
          isActive: true,
          onboardingCompleted: false,
        },
      })
      console.log('✅ Cabinet creation test successful')
      
      const admin = await tx.user.create({
        data: {
          name: testEmail.split('@')[0],
          email: testEmail,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          cabinetId: cabinet.id,
        },
        select: { id: true, name: true, email: true, role: true, cabinetId: true },
      })
      console.log('✅ User creation test successful')
      
      // Rollback the transaction
      throw new Error('Test rollback - no data committed')
    })
  }
} catch (error) {
  if (error.message.includes('Test rollback')) {
    console.log('✅ Transaction test successful (rolled back)')
  } else {
    console.log('❌ Registration simulation failed:', error.message)
  }
}
console.log('')

// Test 6: Login API Simulation
console.log('📋 TEST 6: Login API Simulation')
console.log('--------------------------------')
try {
  // Find an existing user for login test
  const existingUser = await prisma.user.findFirst({
    where: { isActive: true },
    include: {
      cabinet: {
        select: {
          id: true,
          nom: true,
          type: true,
          onboardingCompleted: true,
          isActive: true
        }
      }
    }
  })
  
  if (existingUser) {
    console.log(`✅ Found user for login test: ${existingUser.email}`)
    
    // Test password comparison
    const testPassword = 'wrongpassword'
    const isPasswordValid = await bcrypt.compare(testPassword, existingUser.password)
    console.log(`✅ Password comparison test: ${isPasswordValid ? 'Valid' : 'Invalid'} (expected: Invalid)`)
    
    // Test user data structure
    const userData = {
      id: existingUser.id,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      cabinetId: existingUser.cabinetId,
      cabinetName: existingUser.cabinet?.nom || null,
      cabinetType: existingUser.cabinet?.type || null,
      cabinetOnboardingCompleted: existingUser.cabinet?.onboardingCompleted || false
    }
    console.log('✅ User data structure test successful:', Object.keys(userData))
  } else {
    console.log('⚠️  No users found for login test')
  }
} catch (error) {
  console.log('❌ Login simulation failed:', error.message)
}
console.log('')

// Test 7: Database Performance
console.log('📋 TEST 7: Database Performance Check')
console.log('-------------------------------------')
try {
  const startTime = Date.now()
  
  // Test multiple queries
  await Promise.all([
    prisma.user.count(),
    prisma.cabinet.count(),
    prisma.plan.count(),
    prisma.subscription.count()
  ])
  
  const endTime = Date.now()
  const duration = endTime - startTime
  
  console.log(`✅ Database performance test: ${duration}ms for 4 queries`)
  
  if (duration > 1000) {
    console.log('⚠️  Database seems slow (>1s for basic queries)')
  }
} catch (error) {
  console.log('❌ Database performance test failed:', error.message)
}
console.log('')

// Test 8: Prisma Client Health
console.log('📋 TEST 8: Prisma Client Health')
console.log('--------------------------------')
try {
  // Test connection pool
  await prisma.$queryRaw`SELECT 1`
  console.log('✅ Prisma connection pool healthy')
  
  // Test query builder
  const result = await prisma.user.findMany({
    take: 1,
    select: { id: true, email: true }
  })
  console.log('✅ Prisma query builder working')
  
} catch (error) {
  console.log('❌ Prisma client health check failed:', error.message)
}
console.log('')

// Summary
console.log('📋 SUMMARY & RECOMMENDATIONS')
console.log('============================')
console.log('If all tests passed:')
console.log('  ✅ Your database and authentication setup is healthy')
console.log('  ✅ The 500 error might be intermittent or caused by:')
console.log('     - High database load')
console.log('     - Network issues')
console.log('     - Race conditions in concurrent requests')
console.log('')
console.log('If tests failed:')
console.log('  🔧 Fix the specific issues reported above')
console.log('  🔧 Run: npm run db:migrate to ensure schema is up to date')
console.log('  🔧 Run: npm run db:seed to create required data')
console.log('')
console.log('Next steps:')
console.log('  1. Monitor your application logs during registration attempts')
console.log('  2. Check database connection limits in production')
console.log('  3. Consider adding retry logic for database operations')
console.log('  4. Enable Prisma query logging for detailed debugging')

// Cleanup
await prisma.$disconnect()
console.log('\n✅ Debug suite completed - database disconnected')
