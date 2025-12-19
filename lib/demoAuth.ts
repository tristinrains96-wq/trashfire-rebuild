/**
 * Demo Authentication for Public UI Branch
 * Provides mock authentication that always succeeds
 * NO REAL AUTHENTICATION - FOR DEMO ONLY
 */

export interface DemoUser {
  id: string
  email: string
  name: string
  avatar?: string
}

// Mock user for demo mode
export const DEMO_USER: DemoUser = {
  id: 'demo_user_001',
  email: 'demo@trashfire.ai',
  name: 'Demo User',
  avatar: undefined,
}

/**
 * Check if we're in demo mode (no Clerk keys configured)
 */
export function isDemoMode(): boolean {
  if (typeof window === 'undefined') return true
  
  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  return !clerkKey || clerkKey === 'pk_test_...'
}

/**
 * Get demo user (always returns logged in user in demo mode)
 */
export function getDemoUser(): DemoUser | null {
  if (isDemoMode()) {
    return DEMO_USER
  }
  return null
}

/**
 * Check if user is authenticated (always true in demo mode)
 */
export function isAuthenticated(): boolean {
  return isDemoMode()
}

