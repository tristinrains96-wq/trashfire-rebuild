/**
 * Phase 2.5 Guardrails Configuration Check
 * Verifies that all guardrails are properly configured
 * Run with: npm run phase2_5:check
 * 
 * This script does NOT require any provider API keys.
 * It works with GENERATION_ENABLED=false.
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

let hasErrors = false

// 1) Verify required env vars exist
function checkEnvVars() {
  console.log('\n[Check] Environment Variables\n')

  const requiredVars = [
    'GENERATION_ENABLED',
    'ALLOWLIST_EMAILS',
    'MAX_EPISODES_PER_DAY',
    'MAX_REROLLS_PER_DAY',
    'MAX_WRITER_RUNS_PER_DAY',
    'GLOBAL_DAILY_SPEND_CAP_USD',
    'PER_USER_DAILY_SPEND_CAP_USD',
  ]

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (value === undefined || value.trim() === '') {
      console.error(`✗ ${varName}: Missing or empty`)
      hasErrors = true
    } else {
      // Don't print actual values for security (especially ALLOWLIST_EMAILS)
      if (varName === 'ALLOWLIST_EMAILS') {
        const emails = value.split(',').map(e => e.trim()).filter(Boolean)
        console.log(`✓ ${varName}: Set with ${emails.length} email(s)`)
      } else {
        console.log(`✓ ${varName}: Set`)
      }
    }
  }
}

// 2) Call /api/guardrails/check and print JSON
async function checkGuardrailsEndpoint() {
  console.log('\n[Check] Guardrails API Endpoint\n')

  try {
    const response = await fetch(`${API_BASE}/api/guardrails/check`)
    
    if (response.status === 401) {
      console.log('✓ Guardrails API: Endpoint exists (requires authentication)')
      console.log('  Status: 401 (expected - requires Clerk auth)')
      return
    }

    if (!response.ok) {
      console.error(`✗ Guardrails API: Unexpected status ${response.status}`)
      hasErrors = true
      return
    }

    const data = await response.json()
    console.log('✓ Guardrails API: Endpoint accessible')
    console.log(JSON.stringify(data, null, 2))
  } catch (error: any) {
    console.error(`✗ Guardrails API: Error - ${error.message}`)
    console.error('  Note: Is the dev server running? Try: npm run dev')
    hasErrors = true
  }
}

// 3) Call /api/admin/check (handle 404 gracefully)
async function checkAdminEndpoint() {
  console.log('\n[Check] Admin Check API Endpoint\n')

  try {
    const response = await fetch(`${API_BASE}/api/admin/check`)
    
    if (response.status === 404) {
      console.log('ADMIN CHECK: skipped (endpoint not found)')
      return
    }

    if (response.status === 401) {
      console.log('✓ Admin Check API: Endpoint exists (requires authentication)')
      console.log('  Status: 401 (expected - requires Clerk auth)')
      return
    }

    if (!response.ok) {
      console.error(`✗ Admin Check API: Unexpected status ${response.status}`)
      hasErrors = true
      return
    }

    const data = await response.json()
    console.log('✓ Admin Check API: Endpoint accessible')
    console.log(JSON.stringify(data, null, 2))
  } catch (error: any) {
    // 404 is acceptable, other errors are not
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      console.log('ADMIN CHECK: skipped (endpoint not found)')
    } else {
      console.error(`✗ Admin Check API: Error - ${error.message}`)
      hasErrors = true
    }
  }
}

async function runAllChecks() {
  console.log('='.repeat(60))
  console.log('Phase 2.5 Guardrails Configuration Check')
  console.log('='.repeat(60))

  checkEnvVars()
  await checkGuardrailsEndpoint()
  await checkAdminEndpoint()

  // 4) Print final single-line status
  console.log('\n' + '='.repeat(60))
  if (hasErrors) {
    console.log('PHASE 2.5 CHECK: FAIL')
    console.log('='.repeat(60))
    process.exit(1) // 5) Exit code 1 on FAIL
  } else {
    console.log('PHASE 2.5 CHECK: PASS')
    console.log('='.repeat(60))
    process.exit(0) // 5) Exit code 0 on PASS
  }
}

// Run checks
runAllChecks().catch(error => {
  console.error('\n✗ Check runner error:', error)
  console.log('PHASE 2.5 CHECK: FAIL')
  process.exit(1)
})
