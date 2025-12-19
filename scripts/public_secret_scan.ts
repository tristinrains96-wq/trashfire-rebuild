#!/usr/bin/env ts-node
/**
 * Public Branch Secret Scanner
 * Scans the public-ui branch for any secret-like patterns.
 * This is stricter than the main branch scanner - NO secrets allowed at all.
 * 
 * Usage: npx ts-node scripts/public_secret_scan.ts
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

// Patterns to search for (secret indicators)
const SECRET_PATTERNS = [
  // Clerk keys
  { name: 'Clerk Publishable Key (test)', pattern: /pk_test_[A-Za-z0-9_-]{40,}/g },
  { name: 'Clerk Publishable Key (live)', pattern: /pk_live_[A-Za-z0-9_-]{40,}/g },
  { name: 'Clerk Secret Key (test)', pattern: /sk_test_[A-Za-z0-9_-]{40,}/g },
  { name: 'Clerk Secret Key (live)', pattern: /sk_live_[A-Za-z0-9_-]{40,}/g },
  // Supabase keys
  { name: 'Supabase Secret', pattern: /sb_secret_[A-Za-z0-9_-]{40,}/g },
  { name: 'JWT Token (Supabase)', pattern: /eyJ[A-Za-z0-9_-]{100,}/g },
  // API keys
  { name: 'API Key (sk-)', pattern: /sk-[A-Za-z0-9_-]{40,}/g },
  { name: 'API Key (sk-ant-)', pattern: /sk-ant-[A-Za-z0-9_-]{40,}/g },
  { name: 'Service Role Key', pattern: /service_role.*[A-Za-z0-9_-]{40,}/g },
  // Environment variable patterns that might contain secrets
  { name: 'Potential Secret in Env Var', pattern: /(?:NEXT_PUBLIC_|SUPABASE_|CLERK_|GROQ_|ELEVENLABS_)[A-Z_]*=.*[A-Za-z0-9_-]{40,}/g },
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
  'tools', // FFmpeg tools
]

// Files to exclude from scanning
const EXCLUDE_FILES = [
  '.env.local',
  '.env',
  'public_secret_scan.ts', // This file itself
  'scan_secrets.ts', // Original scanner
]

interface Finding {
  file: string
  line: number
  patternName: string
  preview: string
}

const findings: Finding[] = []

/**
 * Check if a file should be excluded from scanning
 */
function shouldExcludeFile(filePath: string): boolean {
  const fileName = filePath.split(/[/\\]/).pop() || ''
  if (EXCLUDE_FILES.includes(fileName)) {
    return true
  }
  // Exclude .env files
  if (fileName.startsWith('.env')) {
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

    lines.forEach((line, index) => {
      SECRET_PATTERNS.forEach(({ name, pattern }) => {
        const matches = line.match(pattern)
        if (matches) {
          matches.forEach(match => {
            // Skip if it's clearly a placeholder or check
            if (
              match.includes('...') || 
              match.includes('your_key') || 
              match.includes('YOUR_KEY') ||
              match.includes('pk_test_...') ||
              match.includes('placeholder') ||
              line.includes('!==') ||
              line.includes('===') ||
              line.includes('check') ||
              line.includes('Check')
            ) {
              return
            }

            // Real secret found
            findings.push({
              file: relative(process.cwd(), filePath).replace(/\\/g, '/'),
              line: index + 1,
              patternName: name,
              preview: match.substring(0, 20) + '...',
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
          // Only scan text files
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
  console.log(`[Public Secret Scanner] Scanning repository: ${repoRoot}`)
  console.log('')

  scanDirectory(repoRoot)

  if (findings.length === 0) {
    console.log('✅ PASS: No secrets found in public branch')
    console.log('')
    process.exit(0)
  } else {
    console.error('❌ FAIL: Found potential secrets in tracked files:')
    console.error('')
    findings.forEach(finding => {
      console.error(`  ${finding.file}:${finding.line}`)
      console.error(`    Pattern: ${finding.patternName}`)
      console.error(`    Preview: ${finding.preview}`)
      console.error('')
    })
    console.error('⚠️  Action required:')
    console.error('  1. Remove all secrets from the files above')
    console.error('  2. Ensure no API keys, tokens, or secrets are committed')
    console.error('  3. This is a public branch - zero tolerance for secrets')
    console.error('')
    process.exit(1)
  }
}

// Run the scan
main()

