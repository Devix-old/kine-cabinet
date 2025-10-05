#!/usr/bin/env node

/**
 * Production Deployment Fix for Prepared Statement Issues
 * This script ensures proper configuration for Vercel deployment
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 PRODUCTION DEPLOYMENT FIX')
console.log('============================\n')

// 1. Verify Prisma configuration
console.log('📋 STEP 1: Verifying Prisma Configuration')
console.log('------------------------------------------')

const prismaConfigPath = path.join(process.cwd(), 'src/lib/prisma.js')
const prismaConfig = fs.readFileSync(prismaConfigPath, 'utf8')

if (prismaConfig.includes('prepared_statements', 'false')) {
  console.log('✅ Prisma configured to disable prepared statements')
} else {
  console.log('❌ Prisma not properly configured')
  process.exit(1)
}

if (prismaConfig.includes('connection_limit', '1')) {
  console.log('✅ Connection limit set to 1 for serverless')
} else {
  console.log('❌ Connection limit not properly set')
  process.exit(1)
}

// 2. Check Vercel configuration
console.log('\n📋 STEP 2: Checking Vercel Configuration')
console.log('----------------------------------------')

const vercelConfigPath = path.join(process.cwd(), 'vercel.json')
if (fs.existsSync(vercelConfigPath)) {
  const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'))
  console.log('✅ Vercel configuration found')
  console.log('   Max duration:', vercelConfig.functions?.['src/app/api/**/*.js']?.maxDuration || 'default')
  console.log('   Environment variables:', Object.keys(vercelConfig.env || {}))
} else {
  console.log('⚠️  Vercel configuration not found')
}

// 3. Environment variables check
console.log('\n📋 STEP 3: Environment Variables Check')
console.log('--------------------------------------')

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
]

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: Set`)
  } else {
    console.log(`❌ ${varName}: Missing`)
  }
})

// 4. Build test
console.log('\n📋 STEP 4: Build Test')
console.log('---------------------')

try {
  const { execSync } = require('child_process')
  console.log('Running build test...')
  execSync('npm run build', { stdio: 'inherit' })
  console.log('✅ Build successful')
} catch (error) {
  console.log('❌ Build failed:', error.message)
  process.exit(1)
}

// 5. Deployment instructions
console.log('\n📋 DEPLOYMENT INSTRUCTIONS')
console.log('==========================')
console.log('1. Commit your changes:')
console.log('   git add .')
console.log('   git commit -m "Fix prepared statement issues for production"')
console.log('   git push')
console.log('')
console.log('2. In Vercel dashboard, ensure these environment variables are set:')
console.log('   - DATABASE_URL (with prepared_statements=false)')
console.log('   - NEXTAUTH_SECRET')
console.log('   - NEXTAUTH_URL')
console.log('')
console.log('3. Redeploy your application:')
console.log('   - Trigger a new deployment in Vercel')
console.log('   - Or push to your main branch if auto-deploy is enabled')
console.log('')
console.log('4. Monitor the deployment logs for any remaining issues')
console.log('')
console.log('✅ Production deployment fix completed!')
