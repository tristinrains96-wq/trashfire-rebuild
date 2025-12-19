'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEMO_USER, isDemoMode } from '@/lib/demoAuth'

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: User | null) => void
  syncWithClerk: () => void
}

// Check if Clerk is enabled
const CLERK_ENABLED = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

// In demo mode, always start with demo user logged in
const getInitialAuthState = () => {
  if (typeof window !== 'undefined' && isDemoMode()) {
    return {
      user: DEMO_USER,
      isAuthenticated: true,
    }
  }
  return {
    user: null,
    isAuthenticated: false,
  }
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      ...getInitialAuthState(),
      login: async (email: string, password: string) => {
        // Mock login - only used as fallback when Clerk is not enabled
        const user: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          avatar: undefined,
        }
        set({ user, isAuthenticated: true })
        return true
      },
      logout: async () => {
        // If Clerk is enabled, use Clerk's signOut
        if (CLERK_ENABLED) {
          try {
            const { useClerk } = require('@clerk/nextjs')
            const clerk = useClerk()
            if (clerk) {
              await clerk.signOut()
            }
          } catch (err) {
            console.warn('[Auth] Clerk signOut failed, clearing local state')
          }
        }
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },
      syncWithClerk: () => {
        // Sync auth state with Clerk
        if (CLERK_ENABLED) {
          try {
            const { useUser } = require('@clerk/nextjs')
            // This will be called from components that use Clerk hooks
            // The actual sync happens in components that use both hooks
          } catch (err) {
            // Clerk not available
          }
        }
      },
    }),
    {
      name: 'trashfire-auth',
    }
  )
)

// Helper hook to sync Zustand store with Clerk
export function useClerkAuthSync() {
  if (CLERK_ENABLED) {
    try {
      const { useUser, useAuth: useClerkAuth } = require('@clerk/nextjs')
      const { user } = useUser()
      const { isSignedIn } = useClerkAuth()
      const { setUser } = useAuth()

      // Sync Clerk state to Zustand store
      if (isSignedIn && user) {
        setUser({
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: user.firstName || user.username || 'User',
          avatar: user.imageUrl,
        })
      } else {
        setUser(null)
      }
    } catch (err) {
      // Clerk not available, use mock auth
    }
  }
}

