/**
 * Auth utilities for TrashFire
 * Clerk authentication middleware and helpers
 */

import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export async function getAuthUser(request?: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return null

    // Get user details from Clerk
    const user = await clerkClient.users.getUser(userId)
    return {
      id: userId,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.firstName || user.username || 'User',
    }
  } catch (error) {
    console.error('[Auth] Error getting user:', error)
    return null
  }
}

/**
 * Require authentication for API route
 * Throws error if not authenticated
 */
export async function requireAuth(request?: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    throw new Error('Unauthorized: Authentication required')
  }
  return user
}

/**
 * Rate limiting helper
 * Tracks requests per user per minute
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const key = userId
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetAt) {
    // Reset window
    rateLimitMap.set(key, {
      count: 1,
      resetAt: now + windowMs,
    })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  }
}

