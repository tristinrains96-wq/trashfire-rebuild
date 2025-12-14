/**
 * Billing system for TrashFire
 * Supports disabled/mock/live modes for development and production
 */

export type BillingMode = 'disabled' | 'mock' | 'live'

export interface BillingConfig {
  mode: BillingMode
  stripePublishableKey?: string
  stripeSecretKey?: string
  requireTokenForHighQuality: boolean
}

export interface TokenCheckResult {
  allowed: boolean
  reason?: string
  tokensRemaining?: number
}

// Default configuration
const DEFAULT_CONFIG: BillingConfig = {
  mode: process.env.NEXT_PUBLIC_BILLING_MODE === 'live' ? 'live' : 
        process.env.NEXT_PUBLIC_BILLING_MODE === 'mock' ? 'mock' : 'disabled',
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  requireTokenForHighQuality: true,
}

let config: BillingConfig = DEFAULT_CONFIG

/**
 * Initialize billing system
 */
export function initBilling(customConfig?: Partial<BillingConfig>) {
  config = { ...DEFAULT_CONFIG, ...customConfig }
}

/**
 * Get current billing configuration
 */
export function getBillingConfig(): BillingConfig {
  return { ...config }
}

/**
 * Check if billing is enabled
 */
export function isBillingEnabled(): boolean {
  return config.mode !== 'disabled'
}

/**
 * Check if user has valid token for HIGH quality generation
 * @param userId - User ID (from Clerk or auth system)
 * @param qualityPreset - Quality preset being requested
 */
export async function checkTokenForQuality(
  userId: string,
  qualityPreset: 'LOW' | 'HIGH'
): Promise<TokenCheckResult> {
  // If billing is disabled, allow all
  if (config.mode === 'disabled') {
    return { allowed: true }
  }

  // LOW quality always allowed
  if (qualityPreset === 'LOW') {
    return { allowed: true }
  }

  // HIGH quality requires token check if enabled
  if (config.requireTokenForHighQuality && qualityPreset === 'HIGH') {
    if (config.mode === 'mock') {
      // Mock mode: simulate token check
      return { 
        allowed: true, 
        tokensRemaining: 10,
        reason: 'mock_mode'
      }
    }

    if (config.mode === 'live') {
      // Live mode: check Stripe subscription
      try {
        // TODO: Implement actual Stripe API call
        // const response = await fetch('/api/billing/check-token', {
        //   method: 'POST',
        //   body: JSON.stringify({ userId, qualityPreset }),
        // })
        // return await response.json()
        
        // Placeholder for live implementation
        return {
          allowed: false,
          reason: 'stripe_not_configured',
        }
      } catch (error) {
        console.error('Billing check failed:', error)
        return {
          allowed: false,
          reason: 'billing_error',
        }
      }
    }
  }

  return { allowed: true }
}

/**
 * Deduct token after generation
 * @param userId - User ID
 * @param qualityPreset - Quality preset used
 */
export async function deductToken(
  userId: string,
  qualityPreset: 'LOW' | 'HIGH'
): Promise<boolean> {
  if (config.mode === 'disabled') {
    return true
  }

  if (qualityPreset === 'LOW') {
    return true // LOW quality doesn't consume tokens
  }

  if (config.mode === 'mock') {
    // Mock mode: simulate token deduction
    return true
  }

  if (config.mode === 'live') {
    // TODO: Implement actual Stripe API call to deduct token
    // const response = await fetch('/api/billing/deduct-token', {
    //   method: 'POST',
    //   body: JSON.stringify({ userId, qualityPreset }),
    // })
    // return response.ok
    return false // Placeholder
  }

  return false
}

/**
 * Get user's token balance
 * @param userId - User ID
 */
export async function getTokenBalance(userId: string): Promise<number> {
  if (config.mode === 'disabled') {
    return Infinity
  }

  if (config.mode === 'mock') {
    return 10 // Mock balance
  }

  if (config.mode === 'live') {
    // TODO: Implement actual Stripe API call
    // const response = await fetch(`/api/billing/tokens/${userId}`)
    // const data = await response.json()
    // return data.tokens
    return 0 // Placeholder
  }

  return 0
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return !!(
    config.stripePublishableKey &&
    config.stripeSecretKey &&
    config.mode === 'live'
  )
}
