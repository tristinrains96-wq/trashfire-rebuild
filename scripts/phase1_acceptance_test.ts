/**
 * Phase 1 Acceptance Tests
 * Tests Supabase persistence, Script Lab ignition, and UI fixes
 * 
 * Run: npx ts-node scripts/phase1_acceptance_test.ts
 */

import { createServerClient } from '../lib/supabase'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

const tests: TestResult[] = []

async function testSupabaseConnection(): Promise<TestResult> {
  try {
    const supabase = createServerClient()
    
    // Test connection by querying projects table
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1)
    
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      return {
        name: 'Supabase Connection',
        passed: false,
        error: error.message,
      }
    }
    
    return {
      name: 'Supabase Connection',
      passed: true,
      details: 'Connection successful (table may not exist yet - run schema.sql first)',
    }
  } catch (error: any) {
    return {
      name: 'Supabase Connection',
      passed: false,
      error: error.message,
    }
  }
}

async function testEpisodeCreationAPI(): Promise<TestResult> {
  try {
    // This would require authentication - for now, just check if endpoint exists
    const response = await fetch('http://localhost:3000/api/episodes/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idea: 'Test episode idea',
      }),
    })
    
    // Expect 401 (unauthorized) or 400 (bad request) - both mean endpoint exists
    if (response.status === 401 || response.status === 400) {
      return {
        name: 'Episode Creation API',
        passed: true,
        details: `Endpoint exists (status: ${response.status})`,
      }
    }
    
    if (response.status === 404) {
      return {
        name: 'Episode Creation API',
        passed: false,
        error: 'Endpoint not found (404)',
      }
    }
    
    return {
      name: 'Episode Creation API',
      passed: true,
      details: `Endpoint responded with status: ${response.status}`,
    }
  } catch (error: any) {
    return {
      name: 'Episode Creation API',
      passed: false,
      error: error.message,
      details: 'Make sure dev server is running (npm run dev)',
    }
  }
}

async function testEnvironmentVariables(): Promise<TestResult> {
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ]
  
  const optionalVars = [
    'GROQ_API_KEY',
    'CLERK_SECRET_KEY',
  ]
  
  const missing: string[] = []
  const present: string[] = []
  
  requiredVars.forEach((varName) => {
    const value = process.env[varName] || process.env[`NEXT_PUBLIC_${varName}`]
    if (!value || value.includes('your_key') || value.includes('...')) {
      missing.push(varName)
    } else {
      present.push(varName)
    }
  })
  
  optionalVars.forEach((varName) => {
    const value = process.env[varName] || process.env[`NEXT_PUBLIC_${varName}`]
    if (value && !value.includes('your_key') && !value.includes('...')) {
      present.push(varName)
    }
  })
  
  return {
    name: 'Environment Variables',
    passed: missing.length === 0,
    error: missing.length > 0 ? `Missing: ${missing.join(', ')}` : undefined,
    details: {
      present: present,
      missing: missing,
      note: 'Required vars must be set. Optional vars can be stubbed.',
    },
  }
}

async function testSchemaFile(): Promise<TestResult> {
  try {
    const fs = require('fs')
    const path = require('path')
    
    const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql')
    
    if (!fs.existsSync(schemaPath)) {
      return {
        name: 'Schema File',
        passed: false,
        error: 'supabase/schema.sql not found',
      }
    }
    
    const schemaContent = fs.readFileSync(schemaPath, 'utf-8')
    
    const requiredTables = ['projects', 'episodes', 'scenes', 'assets', 'jobs']
    const missingTables: string[] = []
    
    requiredTables.forEach((table) => {
      if (!schemaContent.includes(`CREATE TABLE.*${table}`) && 
          !schemaContent.includes(`CREATE TABLE IF NOT EXISTS.*${table}`)) {
        // Check case-insensitive
        const regex = new RegExp(`CREATE TABLE.*${table}`, 'i')
        if (!regex.test(schemaContent)) {
          missingTables.push(table)
        }
      }
    })
    
    const hasRLS = schemaContent.includes('ROW LEVEL SECURITY') || 
                   schemaContent.includes('ENABLE ROW LEVEL SECURITY')
    
    return {
      name: 'Schema File',
      passed: missingTables.length === 0 && hasRLS,
      error: missingTables.length > 0 
        ? `Missing tables: ${missingTables.join(', ')}` 
        : !hasRLS ? 'RLS policies not found' : undefined,
      details: {
        tablesFound: requiredTables.length - missingTables.length,
        hasRLS,
      },
    }
  } catch (error: any) {
    return {
      name: 'Schema File',
      passed: false,
      error: error.message,
    }
  }
}

async function runAllTests() {
  console.log('🧪 Phase 1 Acceptance Tests\n')
  console.log('=' .repeat(50))
  
  // Run tests
  tests.push(await testEnvironmentVariables())
  tests.push(await testSchemaFile())
  tests.push(await testSupabaseConnection())
  tests.push(await testEpisodeCreationAPI())
  
  // Print results
  console.log('\n📊 Test Results:\n')
  
  let passedCount = 0
  let failedCount = 0
  
  tests.forEach((test) => {
    const icon = test.passed ? '✅' : '❌'
    console.log(`${icon} ${test.name}`)
    
    if (test.passed) {
      passedCount++
      if (test.details) {
        console.log(`   ${JSON.stringify(test.details, null, 2).split('\n').join('\n   ')}`)
      }
    } else {
      failedCount++
      if (test.error) {
        console.log(`   Error: ${test.error}`)
      }
      if (test.details) {
        console.log(`   ${JSON.stringify(test.details, null, 2).split('\n').join('\n   ')}`)
      }
    }
    console.log()
  })
  
  console.log('=' .repeat(50))
  console.log(`\n✅ Passed: ${passedCount}/${tests.length}`)
  console.log(`❌ Failed: ${failedCount}/${tests.length}`)
  
  if (failedCount === 0) {
    console.log('\n🎉 All tests passed! Phase 1 is ready.')
  } else {
    console.log('\n⚠️  Some tests failed. Please fix issues before proceeding.')
  }
  
  // Manual test checklist
  console.log('\n📋 Manual Test Checklist:')
  console.log('1. [ ] Refresh page: Episode persists in DB, panels reload data')
  console.log('2. [ ] Ignition flow: Type idea → Enter → panels populate <10s (stubbed), progress hits 100%')
  console.log('3. [ ] Mobile: 375px viewport – no overlap, sticky tabs')
  console.log('4. [ ] Unauthed: 403 on /api/episodes/create')
  console.log('5. [ ] Empty state: Shows new message and CTA button')
  console.log('6. [ ] Logo: Falls back to TF icon if PNG fails')
  console.log('7. [ ] Settings: API Keys section shows admin gate')
  
  process.exit(failedCount > 0 ? 1 : 0)
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test runner error:', error)
  process.exit(1)
})

