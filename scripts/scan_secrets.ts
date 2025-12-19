#!/usr/bin/env ts-node
/**
 * Secret Scanner for TrashFire
 * Scans the repository for hardcoded secrets and API keys.
 * Exits with non-zero code if secrets are found outside allowed files.
 * 
 * Allowed files:
 * - .env.local (git-ignored)
 * - .env.example (placeholders only)
 * - Documentation files with placeholders only
 * 
 * Usage: npx ts-node scripts/scan_secrets.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

// Patterns to search for (secret indicators)
const SECRET_PATTERNS = [
  // Clerk keys
  /pk_test_[A-Za-z0-9_-]{40,}/g,
  /pk_live_[A-Za-z0-9_-]{40,}/g,
  /sk_test_[A-Za-z0-9_-]{40,}/g,
  /sk_live_[A-Za-z0-9_-]{40,}/g,
  // Supabase keys
  /sb_secret_[A-Za-z0-9_-]{40,}/g,
  /eyJ[A-Za-z0-9_-]{100,}/g, // JWT tokens (Supabase service role keys)
  // Other common patterns
  /service_role.*[A-Za-z0-9_-]{40,}/g,
]

// Directories to exclude from scanning
const EXCLUDE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.vercel',
  '.cursor',
]

// Files to exclude from scanning
const EXCLUDE_FILES = [
  '.env.local',
  'scan_secrets.ts', // This file itself
]

// Allowed files that may contain placeholders (not real keys)
const ALLOWED_FILES = [
  '.env.example',
  'SECRET_SAFETY.md',
  'CLERK_SETUP_CHECKLIST.md',
  'ROTATION_GUIDE.md',
  'SUPABASE_SETUP.md',
  'WHERE_TO_ADD_SUPABASE_KEYS.md',
  'SECURITY_AUDIT_REPORT.md',
  'docs/SECRET_SAFETY.md',
  'docs/ONEDRIVE_FIX.md',
]

interface Finding {
  file: string
  line: number
  pattern: string
  preview: string
}

const findings: Finding[] = []

/**
 * Mask a secret value for safe display
 */
function maskSecret(value: string): string {
  if (value.length <= 10) {
    return '****'
  }
  const first6 = value.substring(0, 6)
  const last4 = value.substring(value.length - 4)
  return `${first6}****${last4}`
}

/**
 * Check if a file path is allowed to contain secrets (placeholders only)
 */
function isAllowedFile(filePath: string): boolean {
  const relativePath = relative(process.cwd(), filePath).replace(/\\/g, '/')
  return ALLOWED_FILES.some(allowed => relativePath.includes(allowed))
}

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeFile(filePath: string): boolean {
  const fileName = filePath.split(/[/\\]/).pop() || ''
  if (EXCLUDE_FILES.includes(fileName)) {
    return true
  }
  return false
}

/**
 * Check if a directory should be excluded
 */
function shouldExcludeDir(dirName: string): boolean {
  return EXCLUDE_DIRS.includes(dirName)
}

/**
 * Scan a file for secret patterns
 */
function scanFile(filePath: string): void {
  if (shouldExcludeFile(filePath)) {
    return
  }

  try {
    const content = readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')
    const isAllowed = isAllowedFile(filePath)

    lines.forEach((line, index) => {
      SECRET_PATTERNS.forEach(pattern => {
        const matches = line.match(pattern)
        if (matches) {
          matches.forEach(match => {
            // Skip if it's a placeholder check (like !== 'pk_test_...')
            if (match.includes('...') || match.includes('your_key') || match.includes('YOUR_KEY')) {
              return
            }

            // Skip if it's in an allowed file (docs with placeholders)
            if (isAllowed) {
              // Check if it's actually a real key (longer than typical placeholder)
              // Placeholders are usually short, real keys are 40+ chars
              if (match.length > 50) {
                findings.push({
                  file: relative(process.cwd(), filePath).replace(/\\/g, '/'),
                  line: index + 1,
                  pattern: pattern.toString(),
                  preview: maskSecret(match),
                })
              }
              return
            }

            // Real secret found in non-allowed file
            findings.push({
              file: relative(process.cwd(), filePath).replace(/\\/g, '/'),
              line: index + 1,
              pattern: pattern.toString(),
              preview: maskSecret(match),
            })
          })
        }
      })
    })
  } catch (error) {
    // Skip files that can't be read (binary, permissions, etc.)
  }
}

/**
 * Recursively scan a directory
 */
function scanDirectory(dirPath: string): void {
  try {
    const entries = readdirSync(dirPath)

    entries.forEach(entry => {
      const fullPath = join(dirPath, entry)

      try {
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          if (!shouldExcludeDir(entry)) {
            scanDirectory(fullPath)
          }
        } else if (stat.isFile()) {
          // Only scan text files (common source/documentation files)
          const ext = entry.split('.').pop()?.toLowerCase() || ''
          const textExtensions = [
            'ts', 'tsx', 'js', 'jsx', 'json', 'md', 'txt', 'yml', 'yaml',
            'env', 'example', 'config', 'log',
          ]
          if (textExtensions.includes(ext) || entry.startsWith('.')) {
            scanFile(fullPath)
          }
        }
      } catch (error) {
        // Skip entries that can't be accessed
      }
    })
  } catch (error) {
    // Skip directories that can't be read
  }
}

/**
 * Main scan function
 */
function main(): void {
  const repoRoot = process.cwd()
  console.log(`[Secret Scanner] Scanning repository: ${repoRoot}`)
  console.log('')

  scanDirectory(repoRoot)

  if (findings.length === 0) {
    console.log('✅ PASS: No raw secrets found outside .env.local')
    console.log('')
    console.log('All secrets are properly stored in:')
    console.log('  - .env.local (git-ignored)')
    console.log('  - Environment variables (hosting platform)')
    process.exit(0)
  } else {
    console.error('❌ FAIL: Found potential secrets in tracked files:')
    console.error('')
    findings.forEach(finding => {
      console.error(`  ${finding.file}:${finding.line}`)
      console.error(`    Pattern: ${finding.pattern}`)
      console.error(`    Preview: ${finding.preview}`)
      console.error('')
    })
    console.error('⚠️  Action required:')
    console.error('  1. Remove hardcoded secrets from the files above')
    console.error('  2. Replace with process.env.VARIABLE_NAME')
    console.error('  3. Add real values to .env.local (git-ignored)')
    console.error('')
    process.exit(1)
  }
}

// Run the scan
main()

