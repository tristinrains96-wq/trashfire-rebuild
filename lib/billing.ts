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

/**
 * Subscription tiers with minute caps
 */
export interface SubscriptionTier {
  id: string
  name: string
  price: number
  minuteCap: number // Monthly minute cap
  episodesPerMonth?: number
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 15,
    minuteCap: 10, // 10 minutes/month
    episodesPerMonth: 10,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 40,
    minuteCap: 30, // 30 minutes/month
    episodesPerMonth: 50,
  },
}

/**
 * Check if user has enough credits for generation
 * @param userId - User ID
 * @param estimatedMinutes - Estimated minutes for this generation
 */
export async function checkCredits(
  userId: string,
  estimatedMinutes: number
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  if (config.mode === 'disabled') {
    return { allowed: true }
  }

  if (config.mode === 'mock') {
    // Mock mode: simulate credit check
    const mockRemaining = 30 // Mock remaining minutes
    if (estimatedMinutes > mockRemaining) {
      return {
        allowed: false,
        reason: 'insufficient_credits',
        remaining: mockRemaining,
      }
    }
    return { allowed: true, remaining: mockRemaining - estimatedMinutes }
  }

  if (config.mode === 'live') {
    // TODO: Query database for user's subscription tier and usage
    // For now, stub
    return {
      allowed: false,
      reason: 'stripe_not_fully_configured',
    }
  }

  return { allowed: true }
}

/**
 * Deduct credits after successful render
 * @param userId - User ID
 * @param minutesUsed - Actual minutes used
 */
export async function deductCredits(
  userId: string,
  minutesUsed: number
): Promise<boolean> {
  if (config.mode === 'disabled') {
    return true
  }

  if (config.mode === 'mock') {
    // Mock mode: simulate deduction
    console.log(`[Billing] Mock: Deducted ${minutesUsed} minutes for user ${userId}`)
    return true
  }

  if (config.mode === 'live') {
    // TODO: Update database with usage
    // Deduct from user's monthly allowance
    return true
  }

  return false
}

/**
 * Get user's subscription tier
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier | null> {
  if (config.mode === 'disabled') {
    return SUBSCRIPTION_TIERS.pro // Unlimited in disabled mode
  }

  if (config.mode === 'mock') {
    return SUBSCRIPTION_TIERS.pro // Mock tier
  }

  if (config.mode === 'live') {
    // TODO: Query Stripe/database for user's subscription
    return null
  }

  return null
}

/**
 * Stripe webhook handler for subscription events
 * Handles: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
 */
export async function handleStripeWebhook(
  event: any,
  signature: string
): Promise<{ success: boolean; message?: string }> {
  if (config.mode !== 'live' || !config.stripeSecretKey) {
    return { success: false, message: 'Stripe not configured' }
  }

  // TODO: Verify webhook signature using Stripe SDK
  // const stripe = require('stripe')(config.stripeSecretKey)
  // const verifiedEvent = stripe.webhooks.constructEvent(
  //   event,
  //   signature,
  //   process.env.STRIPE_WEBHOOK_SECRET
  // )

  const eventType = event.type
  const customerId = event.data.object.customer

  switch (eventType) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      // Update user's subscription tier in database
      const subscription = event.data.object
      const tierId = subscription.items.data[0].price.id // Map price ID to tier
      // TODO: Update database
      return { success: true, message: 'Subscription updated' }
    }

    case 'customer.subscription.deleted': {
      // Downgrade user to free tier
      // TODO: Update database
      return { success: true, message: 'Subscription cancelled' }
    }

    default:
      return { success: false, message: 'Unhandled event type' }
  }
}