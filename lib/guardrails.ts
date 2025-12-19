/**
 * Guardrails for TrashFire
 * Safety and cost control: allowlist, kill switch, quotas, spend caps
 */

import { getAuthenticatedSupabaseClient } from './supabase'

// Environment variables with defaults
const GENERATION_ENABLED = process.env.GENERATION_ENABLED !== 'false' // Default true
const ALLOWLIST_EMAILS = process.env.ALLOWLIST_EMAILS?.split(',').map(e => e.trim()).filter(Boolean) || []
const ENABLE_ADMIN_SETTINGS = process.env.ENABLE_ADMIN_SETTINGS === 'true'

// Quota limits (env overrides)
const MAX_EPISODES_PER_DAY = parseInt(process.env.MAX_EPISODES_PER_DAY || '5', 10)
const MAX_REROLLS_PER_DAY = parseInt(process.env.MAX_REROLLS_PER_DAY || '20', 10)
const MAX_WRITER_RUNS_PER_DAY = parseInt(process.env.MAX_WRITER_RUNS_PER_DAY || '10', 10)

// Spend caps (env overrides)
const GLOBAL_DAILY_SPEND_CAP_USD = parseFloat(process.env.GLOBAL_DAILY_SPEND_CAP_USD || '5.0')
const PER_USER_DAILY_SPEND_CAP_USD = parseFloat(process.env.PER_USER_DAILY_SPEND_CAP_USD || '2.0')

export interface GuardrailResult {
  allowed: boolean
  reason?: string
  remaining?: number
  resetAt?: Date
}

/**
 * Check if generation is enabled (kill switch)
 */
export function isGenerationEnabled(): boolean {
  return GENERATION_ENABLED
}

/**
 * Check if user email is in allowlist
 */
export function isUserAllowed(email: string | null | undefined): boolean {
  if (!ALLOWLIST_EMAILS.length) {
    return true // No allowlist set, allow all
  }
  if (!email) {
    return false
  }
  return ALLOWLIST_EMAILS.includes(email)
}

/**
 * Check if admin settings should be enabled
 */
export function isAdminSettingsEnabled(): boolean {
  return ENABLE_ADMIN_SETTINGS
}

/**
 * Check daily quota for user
 */
export async function checkQuota(
  userId: string,
  quotaType: 'episodes' | 'rerolls' | 'writer_runs'
): Promise<GuardrailResult> {
  const supabase = await getAuthenticatedSupabaseClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  let limit: number
  let countQuery: any

  switch (quotaType) {
    case 'episodes':
      limit = MAX_EPISODES_PER_DAY
      countQuery = supabase
        .from('episodes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStr)
      break
    case 'rerolls':
      limit = MAX_REROLLS_PER_DAY
      // Count assets with version > 1 created today
      countQuery = supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('version', 1)
        .gte('created_at', todayStr)
      break
    case 'writer_runs':
      limit = MAX_WRITER_RUNS_PER_DAY
      // Count jobs of type 'outline' created today
      countQuery = supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'outline')
        .gte('created_at', todayStr)
      break
  }

  const { count, error } = await countQuery

  if (error) {
    console.error('[Guardrails] Quota check error:', error)
    // Fail open in case of DB error (but log it)
    return { allowed: true }
  }

  const used = count || 0
  const remaining = Math.max(0, limit - used)
  const allowed = used < limit

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    allowed,
    reason: allowed ? undefined : `Daily ${quotaType} limit reached (${limit}/day)`,
    remaining,
    resetAt: tomorrow,
  }
}

/**
 * Check spend caps (global and per-user)
 */
export async function checkSpendCap(
  userId: string,
  estimatedCost: number
): Promise<GuardrailResult> {
  const supabase = await getAuthenticatedSupabaseClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString()

  // Check global daily spend
  const { data: globalSpend, error: globalError } = await supabase
    .from('spend_events')
    .select('cost_usd')
    .gte('created_at', todayStr)

  if (globalError) {
    console.error('[Guardrails] Global spend check error:', globalError)
    return { allowed: true } // Fail open
  }

  const globalTotal = (globalSpend || []).reduce((sum, e) => sum + parseFloat(e.cost_usd || '0'), 0)
  const globalAfter = globalTotal + estimatedCost

  if (globalAfter > GLOBAL_DAILY_SPEND_CAP_USD) {
    return {
      allowed: false,
      reason: `Global daily spend cap exceeded ($${GLOBAL_DAILY_SPEND_CAP_USD}/day)`,
    }
  }

  // Check per-user daily spend
  const { data: userSpend, error: userError } = await supabase
    .from('spend_events')
    .select('cost_usd')
    .eq('user_id', userId)
    .gte('created_at', todayStr)

  if (userError) {
    console.error('[Guardrails] User spend check error:', userError)
    return { allowed: true } // Fail open
  }

  const userTotal = (userSpend || []).reduce((sum, e) => sum + parseFloat(e.cost_usd || '0'), 0)
  const userAfter = userTotal + estimatedCost

  if (userAfter > PER_USER_DAILY_SPEND_CAP_USD) {
    return {
      allowed: false,
      reason: `Per-user daily spend cap exceeded ($${PER_USER_DAILY_SPEND_CAP_USD}/day)`,
    }
  }

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return {
    allowed: true,
    remaining: PER_USER_DAILY_SPEND_CAP_USD - userAfter,
    resetAt: tomorrow,
  }
}

/**
 * Log spend event
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
  const supabase = await getAuthenticatedSupabaseClient()

  const { error } = await supabase
    .from('spend_events')
    .insert({
      user_id: userId,
      provider,
      cost_usd: costUsd.toFixed(6), // Store as string to avoid precision issues
      meta: meta as any,
    })

  if (error) {
    console.error('[Guardrails] Failed to log spend event:', error)
    // Don't throw - logging failure shouldn't block generation
  }
}

/**
 * Get user quota status
 * Returns default values if Supabase is not configured
 */
export async function getUserQuotaStatus(userId: string): Promise<{
  episodes: { used: number; limit: number; remaining: number }
  rerolls: { used: number; limit: number; remaining: number }
  writer_runs: { used: number; limit: number; remaining: number }
}> {
  try {
    const supabase = await getAuthenticatedSupabaseClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const [episodesRes, rerollsRes, writerRunsRes] = await Promise.all([
      supabase
        .from('episodes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', todayStr),
      supabase
        .from('assets')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gt('version', 1)
        .gte('created_at', todayStr),
      supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'outline')
        .gte('created_at', todayStr),
    ])

    return {
      episodes: {
        used: episodesRes.count || 0,
        limit: MAX_EPISODES_PER_DAY,
        remaining: Math.max(0, MAX_EPISODES_PER_DAY - (episodesRes.count || 0)),
      },
      rerolls: {
        used: rerollsRes.count || 0,
        limit: MAX_REROLLS_PER_DAY,
        remaining: Math.max(0, MAX_REROLLS_PER_DAY - (rerollsRes.count || 0)),
      },
      writer_runs: {
        used: writerRunsRes.count || 0,
        limit: MAX_WRITER_RUNS_PER_DAY,
        remaining: Math.max(0, MAX_WRITER_RUNS_PER_DAY - (writerRunsRes.count || 0)),
      },
    }
  } catch (error) {
    // Return default values if Supabase is not configured
    console.warn('[Guardrails] getUserQuotaStatus: Supabase not available, using defaults')
    return {
      episodes: { used: 0, limit: MAX_EPISODES_PER_DAY, remaining: MAX_EPISODES_PER_DAY },
      rerolls: { used: 0, limit: MAX_REROLLS_PER_DAY, remaining: MAX_REROLLS_PER_DAY },
      writer_runs: { used: 0, limit: MAX_WRITER_RUNS_PER_DAY, remaining: MAX_WRITER_RUNS_PER_DAY },
    }
  }
}

/**
 * Get user spend status
 * Returns default values if Supabase is not configured
 */
export async function getUserSpendStatus(userId: string): Promise<{
  today: number
  limit: number
  remaining: number
  globalToday: number
  globalLimit: number
}> {
  try {
    const supabase = await getAuthenticatedSupabaseClient()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString()

    const [userSpendRes, globalSpendRes] = await Promise.all([
      supabase
        .from('spend_events')
        .select('cost_usd')
        .eq('user_id', userId)
        .gte('created_at', todayStr),
      supabase
        .from('spend_events')
        .select('cost_usd')
        .gte('created_at', todayStr),
    ])

    const userToday = (userSpendRes.data || []).reduce((sum, e) => sum + parseFloat(e.cost_usd || '0'), 0)
    const globalToday = (globalSpendRes.data || []).reduce((sum, e) => sum + parseFloat(e.cost_usd || '0'), 0)

    return {
      today: userToday,
      limit: PER_USER_DAILY_SPEND_CAP_USD,
      remaining: Math.max(0, PER_USER_DAILY_SPEND_CAP_USD - userToday),
      globalToday,
      globalLimit: GLOBAL_DAILY_SPEND_CAP_USD,
    }
  } catch (error) {
    // Return default values if Supabase is not configured
    console.warn('[Guardrails] getUserSpendStatus: Supabase not available, using defaults')
    return {
      today: 0,
      limit: PER_USER_DAILY_SPEND_CAP_USD,
      remaining: PER_USER_DAILY_SPEND_CAP_USD,
      globalToday: 0,
      globalLimit: GLOBAL_DAILY_SPEND_CAP_USD,
    }
  }
}

/**
 * Structured logging for provider calls (never logs secrets)
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
  const logEntry = {
    timestamp: new Date().toISOString(),
    provider,
    user_id: userId,
    episode_id: episodeId,
    cost_usd: costUsd,
    tokens_in: tokensIn,
    tokens_out: tokensOut,
    ...metadata,
  }

  // Never log secrets - filter out any key-like fields
  const safeLog = Object.fromEntries(
    Object.entries(logEntry).filter(([key]) => !key.toLowerCase().includes('key') && !key.toLowerCase().includes('secret'))
  )

  console.log('[Provider Call]', JSON.stringify(safeLog))
}

