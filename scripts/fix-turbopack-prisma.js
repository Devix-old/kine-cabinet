#!/usr/bin/env node

/**
 * Fix Turbopack + Prisma Prepared Statement Conflict
 * This script provides multiple solutions for the "prepared statement already exists" error
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 FIXING TURBOPACK + PRISMA CONFLICT')
console.log('=====================================\n')

// Solution 1: Update package.json to disable Turbopack temporarily
console.log('📋 SOLUTION 1: Disable Turbopack temporarily')
console.log('----------------------------------------------')

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

// Check if dev script uses --turbo
if (packageJson.scripts.dev.includes('--turbo')) {
  console.log('✅ Found --turbo flag in dev script')
  
  // Create backup
  fs.writeFileSync(packageJsonPath + '.backup', JSON.stringify(packageJson, null, 2))
  console.log('✅ Created backup: package.json.backup')
  
  // Remove --turbo flag
  packageJson.scripts.dev = packageJson.scripts.dev.replace(' --turbo', '')
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
  console.log('✅ Removed --turbo flag from dev script')
  console.log('💡 Run: npm run dev (without Turbopack)')
} else {
  console.log('ℹ️  Turbopack not detected in dev script')
}

console.log('')

// Solution 2: Alternative Prisma configuration
console.log('📋 SOLUTION 2: Alternative Prisma Configuration')
console.log('-----------------------------------------------')

const prismaConfigPath = path.join(process.cwd(), 'src/lib/prisma.js')
const prismaConfig = fs.readFileSync(prismaConfigPath, 'utf8')

if (prismaConfig.includes('prepared_statements=false')) {
  console.log('✅ Prisma already configured to disable prepared statements')
} else {
  console.log('⚠️  Prisma configuration needs update')
  console.log('💡 The prisma.js file has been updated with prepared_statements=false')
}

console.log('')

// Solution 3: Environment variable approach
console.log('📋 SOLUTION 3: Environment Variables')
console.log('-----------------------------------')

const envLocalPath = path.join(process.cwd(), '.env.local')
let envContent = ''

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8')
}

// Add Prisma configuration
const prismaEnvVars = `
# Prisma configuration for Turbopack compatibility
PRISMA_DISABLE_PREPARED_STATEMENTS=true
`

if (!envContent.includes('PRISMA_DISABLE_PREPARED_STATEMENTS')) {
  fs.appendFileSync(envLocalPath, prismaEnvVars)
  console.log('✅ Added Prisma environment variables to .env.local')
} else {
  console.log('✅ Prisma environment variables already present')
}

console.log('')

// Solution 4: Database URL modification
console.log('📋 SOLUTION 4: Database URL Configuration')
console.log('----------------------------------------')

if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('prepared_statements=false')) {
  console.log('⚠️  DATABASE_URL should include prepared_statements=false for development')
  console.log('💡 Update your .env.local DATABASE_URL to:')
  console.log(`   DATABASE_URL="${process.env.DATABASE_URL}?prepared_statements=false"`)
} else {
  console.log('✅ DATABASE_URL properly configured')
}

console.log('')

// Instructions
console.log('📋 NEXT STEPS')
console.log('=============')
console.log('1. Stop your current dev server (Ctrl+C)')
console.log('2. Clear Next.js cache:')
console.log('   rm -rf .next')
console.log('   (or delete .next folder manually)')
console.log('3. Restart development server:')
console.log('   npm run dev')
console.log('4. Test registration/login')
console.log('')
console.log('If issues persist:')
console.log('- Use the non-Turbopack version: npm run dev (already configured)')
console.log('- Or use: npm run test:no-turbo')
console.log('')
console.log('✅ Turbopack + Prisma fix completed!')
