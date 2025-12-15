'use client'

import { ReactNode } from 'react'

interface ClientProvidersProps {
  children: ReactNode
}

// Check if Clerk is configured
const CLERK_ENABLED = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Only use ClerkProvider if Clerk is properly configured
  if (CLERK_ENABLED) {
    try {
      const { ClerkProvider } = require('@clerk/nextjs')
      return <ClerkProvider>{children}</ClerkProvider>
    } catch (error) {
      console.warn('[ClientProviders] Clerk not available, rendering without auth:', error)
    }
  }
  
  // Fallback: render children without Clerk
  return <>{children}</>
}

