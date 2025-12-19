'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Check if Clerk is enabled (client-side only check)
const CLERK_ENABLED = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

// Try to import Clerk components
let SignIn: any = null
if (CLERK_ENABLED) {
  try {
    const clerk = require('@clerk/nextjs')
    SignIn = clerk.SignIn
  } catch (error) {
    console.warn('[SignInPage] Clerk not available:', error)
  }
}

export default function SignInPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Only check on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
    if (!CLERK_ENABLED || !SignIn) {
      router.replace('/login')
    }
  }, [router])

  // Show nothing during SSR and initial mount to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#07090a] relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }

  // If Clerk is not enabled, show redirect message
  if (!CLERK_ENABLED || !SignIn) {
    return (
      <div className="min-h-screen bg-[#07090a] relative overflow-hidden flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Redirecting to login...</p>
          <Link href="/login" className="text-[#00ffea] hover:text-[#00e6d1]">
            Click here if not redirected
          </Link>
        </div>
      </div>
    )
  }

  // Render Clerk SignIn component only if Clerk is enabled
  return (
    <div className="min-h-screen bg-[#07090a] relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,234,0.1)_0%,transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,rgba(0,255,200,0.03),transparent_30%)] blur-3xl" />
      </div>

      <div className="w-full max-w-md px-6 z-10 relative">
        <SignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-[#0a0f15]/95 backdrop-blur-xl border border-white/10 shadow-[0_0_60px_rgba(0,255,234,0.2)]',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/60',
              socialButtonsBlockButton: 'bg-black/30 border-white/10 text-white hover:bg-black/50',
              formButtonPrimary: 'bg-[#00ffea] hover:bg-[#00e6d1] text-black font-semibold shadow-[0_0_20px_rgba(0,255,234,0.3)]',
              formFieldInput: 'bg-black/30 border-white/10 text-white placeholder:text-white/40 focus:border-[#00ffea]',
              formFieldLabel: 'text-white/80',
              footerActionLink: 'text-[#00ffea] hover:text-[#00e6d1]',
              identityPreviewText: 'text-white',
              identityPreviewEditButton: 'text-[#00ffea]',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
      </div>
    </div>
  )
}

