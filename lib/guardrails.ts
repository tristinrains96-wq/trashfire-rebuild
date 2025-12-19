/**
 * Guardrails stub for Public UI Demo Branch
 * NO REAL GUARDRAILS - FOR DEMO ONLY
 * All checks return allowed=true with default values
 */

export interface GuardrailResult {
  allowed: boolean
  reason?: string
  remaining?: number
  resetAt?: Date
}

// Default limits (for display only)
const MAX_EPISODES_PER_DAY = 5
const MAX_REROLLS_PER_DAY = 20
const MAX_WRITER_RUNS_PER_DAY = 10
const PER_USER_DAILY_SPEND_CAP_USD = 2.0
const GLOBAL_DAILY_SPEND_CAP_USD = 5.0

/**
 * Check if generation is enabled (always true in demo)
 */
export function isGenerationEnabled(): boolean {
  return true
}

/**
 * Check if user email is in allowlist (always true in demo)
 */
export function isUserAllowed(email: string | null | undefined): boolean {
  return true
}

/**
 * Check if admin settings should be enabled (always false in demo)
 */
export function isAdminSettingsEnabled(): boolean {
  return false
}

/**
 * Check daily quota (always allowed in demo)
 */
export async function checkQuota(
  userId: string,
  quotaType: 'episodes' | 'rerolls' | 'writer_runs'
): Promise<GuardrailResult> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return {
    allowed: true,
    remaining: 999,
    resetAt: tomorrow,
  }
}

/**
 * Check spend caps (always allowed in demo)
 */
export async function checkSpendCap(
  userId: string,
  estimatedCost: number
): Promise<GuardrailResult> {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return {
    allowed: true,
    remaining: PER_USER_DAILY_SPEND_CAP_USD,
    resetAt: tomorrow,
  }
}

/**
 * Log spend event (no-op in demo)
 */
export async function logSpendEvent(
  userId: string,
  provider: 'claude' | 'groq' | 'runpod' | 'elevenlabs',
  costUsd: number,
  meta: {
    episode_id?: string
    asset_id?: string
    tokens_in?: number
    tokens_out?: number
    [key: string]: any
  } = {}
): Promise<void> {
  // No-op in demo mode
  console.log('[Guardrails Demo] Spend event logged:', { provider, costUsd })
}

/**
 * Get user quota status (returns defaults in demo)
 */
export async function getUserQuotaStatus(userId: string): Promise<{
  episodes: { used: number; limit: number; remaining: number }
  rerolls: { used: number; limit: number; remaining: number }
  writer_runs: { used: number; limit: number; remaining: number }
}> {
  return {
    episodes: { used: 0, limit: MAX_EPISODES_PER_DAY, remaining: MAX_EPISODES_PER_DAY },
    rerolls: { used: 0, limit: MAX_REROLLS_PER_DAY, remaining: MAX_REROLLS_PER_DAY },
    writer_runs: { used: 0, limit: MAX_WRITER_RUNS_PER_DAY, remaining: MAX_WRITER_RUNS_PER_DAY },
  }
}

/**
 * Get user spend status (returns defaults in demo)
 */
export async function getUserSpendStatus(userId: string): Promise<{
  today: number
  limit: number
  remaining: number
  globalToday: number
  globalLimit: number
}> {
  return {
    today: 0,
    limit: PER_USER_DAILY_SPEND_CAP_USD,
    remaining: PER_USER_DAILY_SPEND_CAP_USD,
    globalToday: 0,
    globalLimit: GLOBAL_DAILY_SPEND_CAP_USD,
  }
}

/**
 * Structured logging (no-op in demo)
 */
export function logProviderCall(
  provider: 'claude' | 'groq' | 'runpod' | 'elevenlabs',
  userId: string,
  episodeId: string | null,
  costUsd: number,
  tokensIn?: number,
  tokensOut?: number,
  metadata?: Record<string, any>
): void {
  // No-op in demo mode
  console.log('[Provider Call Demo]', { provider, userId, episodeId })
}
