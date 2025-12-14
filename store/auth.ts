'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Mock login - accept any credentials for now
        const user: User = {
          id: '1',
          email,
          name: email.split('@')[0],
          avatar: undefined,
        }
        set({ user, isAuthenticated: true })
        return true
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'trashfire-auth',
    }
  )
)

