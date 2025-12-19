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

// Dynamically import ClerkProvider only if enabled
let ClerkProvider: any = null
if (CLERK_ENABLED) {
  try {
    // Use dynamic import to avoid SSR issues
    const clerk = require('@clerk/nextjs')
    ClerkProvider = clerk.ClerkProvider
  } catch (error) {
    console.warn('[ClientProviders] Clerk package not available:', error)
  }
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  // Only use ClerkProvider if Clerk is properly configured and available
  if (CLERK_ENABLED && ClerkProvider) {
    return (
      <ClerkProvider
        publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      >
        {children}
      </ClerkProvider>
    )
  }
  
  // Fallback: render children without Clerk
  return <>{children}</>
}

