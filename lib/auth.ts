/**
 * Auth utilities stub for Public UI Demo Branch
 * NO REAL AUTHENTICATION - FOR DEMO ONLY
 * Uses demo auth from lib/demoAuth.ts
 */

import { getDemoUser, isAuthenticated as isDemoAuthenticated } from './demoAuth'

/**
 * Get authenticated user (returns demo user)
 */
export async function getAuthUser(request?: any) {
  const demoUser = getDemoUser()
  if (demoUser) {
    return {
      id: demoUser.id,
      email: demoUser.email,
      name: demoUser.name,
    }
  }
  return null
}

/**
 * Require authentication (always succeeds in demo)
 */
export async function requireAuth(request?: any) {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Error('Unauthorized: Authentication required')
  }
  return user
}

/**
 * Check if user is allowed (always true in demo)
 */
export function checkAllowlist(email: string | null | undefined): { allowed: boolean; reason?: string } {
  return { allowed: true }
}

/**
 * Rate limiting helper (always allows in demo)
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const resetAt = now + windowMs
  
  return {
    allowed: true,
    remaining: maxRequests,
    resetAt,
  }
}
