'use client'

import { ReactNode } from 'react'
import { ClerkProvider } from '@clerk/nextjs'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ClerkProvider>
      {children}
    </ClerkProvider>
  )
}

