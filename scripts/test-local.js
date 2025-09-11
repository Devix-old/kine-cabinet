#!/usr/bin/env node

/**
 * Local Testing Script for Kine-Cabinet
 * Run this before pushing changes to ensure everything works
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting local testing pipeline...\n');

// Color codes for better output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${colors.blue}▶ ${description}${colors.reset}`);
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} - PASSED`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - FAILED`, 'red');
    log(`Error: ${error.message}`, 'red');
    return false;
  }
}

// Check if .env.local exists
function checkEnvironment() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log('⚠️  Warning: .env.local not found. Make sure you have environment variables set up.', 'yellow');
    log('   Create .env.local with your database and API keys.', 'yellow');
  } else {
    log('✅ Environment file found', 'green');
  }
}

// Main testing pipeline
async function runTests() {
  let allPassed = true;

  // 1. Environment check
  checkEnvironment();

  // 2. Install dependencies
  if (!runCommand('npm ci', 'Installing dependencies')) {
    allPassed = false;
  }

  // 3. Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    allPassed = false;
  }

  // 4. Run linting
  if (!runCommand('npm run lint', 'Running ESLint')) {
    allPassed = false;
  }

  // 5. Type checking (if TypeScript is used)
  try {
    if (fs.existsSync('tsconfig.json')) {
      if (!runCommand('npx tsc --noEmit', 'Type checking')) {
        allPassed = false;
      }
    }
  } catch (error) {
    // TypeScript not configured, skip
  }

  // 6. Build application
  if (!runCommand('npm run build', 'Building application')) {
    allPassed = false;
  }

  // 7. Database migration check
  try {
    if (!runCommand('npx prisma migrate status', 'Checking database migrations')) {
      log('⚠️  Database migrations may need attention', 'yellow');
    }
  } catch (error) {
    log('⚠️  Could not check database migrations', 'yellow');
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    log('🎉 All tests passed! Ready to commit and push.', 'green');
    log('\nNext steps:', 'bold');
    log('1. git add .');
    log('2. git commit -m "feat: your feature description"');
    log('3. git push origin your-feature-branch');
    log('4. Create a Pull Request');
  } else {
    log('❌ Some tests failed. Please fix the issues before pushing.', 'red');
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
