#!/usr/bin/env ts-node
/**
 * Public Branch Safety Check
 * Runs secret scan and build check to ensure the branch is safe for public release.
 * 
 * Usage: npx ts-node scripts/public_check.ts
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'

console.log('=== PUBLIC BRANCH SAFETY CHECK ===\n')

let hasErrors = false

// Step 1: Secret Scan
console.log('Step 1: Running secret scan...')
console.log('')
try {
  execSync('npx ts-node scripts/public_secret_scan.ts', {
    stdio: 'inherit',
    cwd: process.cwd(),
  })
  console.log('✅ Secret scan passed\n')
} catch (error) {
  console.error('❌ Secret scan failed\n')
  hasErrors = true
}

// Step 2: Build Check
console.log('Step 2: Running build check...')
console.log('')
try {
  // Check if node_modules exists
  if (!existsSync('node_modules')) {
    console.log('⚠️  node_modules not found. Run npm install first.')
    console.log('   Skipping build check (install dependencies first)\n')
  } else {
    execSync('npm run build', {
      stdio: 'inherit',
      cwd: process.cwd(),
    })
    console.log('✅ Build check passed\n')
  }
} catch (error) {
  console.error('❌ Build check failed\n')
  hasErrors = true
}

// Final result
console.log('=== CHECK COMPLETE ===\n')
if (hasErrors) {
  console.error('❌ PUBLIC BRANCH CHECK FAILED')
  console.error('   Fix the errors above before making this branch public.')
  process.exit(1)
} else {
  console.log('✅ PUBLIC BRANCH CHECK PASSED')
  console.log('   This branch appears safe for public release.')
  process.exit(0)
}

