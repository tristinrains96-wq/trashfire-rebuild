/**
 * Demo Mode Utilities for Public UI Branch
 * Provides helpers to detect demo mode and show appropriate messages
 */

import { toast } from './toast'

/**
 * Check if we're in demo mode (no API endpoints available)
 */
export function isDemoMode(): boolean {
  // In the public-ui branch, we're always in demo mode
  return true
}

/**
 * Show demo mode message when generation is attempted
 */
export function showDemoModeMessage(action: string = 'generation'): void {
  toast.info(`Demo Mode: ${action} is disabled. This is a UI-only demo branch.`)
  console.log(`[Demo Mode] ${action} attempted but disabled`)
}

/**
 * Mock API response for demo mode
 */
export function getDemoModeResponse<T>(mockData: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      showDemoModeMessage('API call')
      resolve(mockData)
    }, 500)
  })
}

/**
 * Replace fetch calls with demo mode handler
 */
export async function demoFetch<T>(
  url: string,
  options?: RequestInit,
  mockData?: T
): Promise<Response> {
  showDemoModeMessage(`API call to ${url}`)
  
  // Return a mock response
  const mockResponse = {
    ok: true,
    status: 200,
    json: async () => mockData || ({} as T),
    text: async () => JSON.stringify(mockData || {}),
  } as Response
  
  return Promise.resolve(mockResponse)
}

