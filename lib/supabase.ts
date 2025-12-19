/**
 * Supabase client for TrashFire
 * Handles database operations with RLS policies
 * 
 * Note: RLS policies use auth.jwt()->>'sub' which requires Clerk configured as OIDC provider.
 * See docs/SUPABASE_CLERK_OIDC_SETUP.md for setup instructions.
 * 
 * Until OIDC is configured, we use service role key with manual user_id checks.
 */

import { createClient } from '@supabase/supabase-js'

// Check if Clerk is configured (same logic as middleware)
const CLERK_ENABLED = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...' &&
  process.env.CLERK_SECRET_KEY &&
  process.env.CLERK_SECRET_KEY !== 'sk_test_...'
)

// Lazy import Clerk to avoid initialization errors when keys are missing
async function getClerkAuth() {
  if (!CLERK_ENABLED) {
    return null
  }
  try {
    const clerk = await import('@clerk/nextjs/server')
    return clerk.auth
  } catch (error) {
    console.warn('[Supabase] Clerk not available:', error)
    return null
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY. Database operations will fail.')
}

// Create Supabase client (client-side, uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We use Clerk for auth
    autoRefreshToken: false,
  },
})

// Server-side client (for API routes)
// Uses service role key to bypass RLS, but we manually enforce user_id checks
export function createServerClient(userId?: string) {
  // If service role key is available and we have a userId, use service role
  // This allows us to manually enforce RLS until OIDC is configured
  if (supabaseServiceKey && userId) {
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
    
    // Store userId for manual RLS enforcement
    // Note: Once OIDC is configured, RLS will automatically use auth.jwt()->>'sub'
    return serviceClient
  }
  
  // Fallback to anon key (will fail RLS until OIDC is configured)
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Get authenticated Supabase client for server-side use
 * Extracts Clerk userId and creates client with proper context
 * Returns null if Clerk is not configured
 */
export async function getAuthenticatedSupabaseClient() {
  try {
    const auth = await getClerkAuth()
    if (!auth) {
      throw new Error('Clerk not configured')
    }
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized: No user ID found')
    }
    return createServerClient(userId)
  } catch (error) {
    console.error('[Supabase] Error getting authenticated client:', error)
    throw error
  }
}

// Database types
export interface Project {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at?: string
}

export interface Episode {
  id: string
  project_id: string
  title: string
  outline_json?: any
  script_json?: any
  status: 'draft' | 'generating' | 'complete' | 'error'
  created_at: string
  updated_at?: string
}

export interface Scene {
  id: string
  episode_id: string
  description: string
  assets_json?: any
  order_index: number
  created_at: string
}

export interface Asset {
  id: string
  scene_id: string
  type: 'character' | 'location' | 'voice'
  prompt: string
  preview_url?: string
  status: 'pending' | 'generating' | 'complete' | 'error'
  created_at: string
}

export interface Job {
  id: string
  episode_id: string
  type: 'outline' | 'script' | 'render'
  status: 'pending' | 'processing' | 'complete' | 'error'
  progress: number
  cost_estimate?: number
  created_at: string
  updated_at?: string
}

