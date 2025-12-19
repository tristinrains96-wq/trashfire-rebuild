'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { useAuth } from '@/store/auth'

// Check if Clerk is enabled
const CLERK_ENABLED = !!(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth() // Use the hook properly at component level

  // Redirect to Clerk sign-in if Clerk is enabled
  useEffect(() => {
    if (CLERK_ENABLED) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(redirect)}`)
    }
  }, [router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // If Clerk is enabled, redirect to Clerk sign-in
    if (CLERK_ENABLED) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(`/sign-in?redirect_url=${encodeURIComponent(redirect)}`)
      return
    }
    
    console.log('=== LOGIN FORM SUBMITTED ===')
    console.log('Email:', email)
    console.log('Password length:', password.length)
    
    if (!email || !password) {
      setError('Please enter both email and password')
      console.log('Validation failed: missing email or password')
      return
    }
    
    setError('')
    setIsLoading(true)
    console.log('Starting login process...')

    try {
      // Use simple mock auth - always succeeds (only when Clerk is disabled)
      console.log('Using mock authentication')
      console.log('Calling login function...')
      const success = await login(email, password)
      console.log('Login result:', success)
      
      if (success) {
        const redirect = searchParams.get('redirect') || '/dashboard'
        console.log('Login successful! Redirecting to:', redirect)
        setIsLoading(false)
        router.push(redirect)
      } else {
        console.log('Login failed')
        setError('Invalid credentials')
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error('=== LOGIN ERROR ===', err)
      setError(err.message || 'An error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('=== BUTTON CLICKED ===', {
      email: email.length > 0,
      password: password.length > 0,
      isLoading
    })
    // Don't prevent default - let form handle it
  }

  return (
    <div className="min-h-screen bg-[#07090a] relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,234,0.1)_0%,transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,rgba(0,255,200,0.03),transparent_30%)] blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 px-6 py-6 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={160}
              height={48}
              className="h-8 w-auto"
              priority
            />
          </Link>
          <Link href="/">
            <Button variant="ghost" className="text-white/80 hover:text-white">
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md px-6 z-10 relative"
      >
        <Card className={cn(
          "bg-[#0a0f15]/95 backdrop-blur-xl",
          "border border-white/10",
          "shadow-[0_0_60px_rgba(0,255,234,0.2)]"
        )}>
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/trashfire-logo.png"
                alt="TrashFire"
                width={200}
                height={60}
                className="h-12 w-auto"
                priority
              />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Welcome Back
            </CardTitle>
            <p className="text-white/60 mt-2">
              Sign in to continue to TrashFire
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    console.log('Email changed:', e.target.value)
                    setEmail(e.target.value)
                  }}
                  placeholder="you@example.com"
                  required
                  className={cn(
                    "bg-black/30 border-white/10",
                    "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                    "text-white placeholder:text-white/40"
                  )}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    console.log('Password changed, length:', e.target.value.length)
                    setPassword(e.target.value)
                  }}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "bg-black/30 border-white/10",
                    "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                    "text-white placeholder:text-white/40"
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                onClick={handleButtonClick}
                className={cn(
                  "w-full relative z-20",
                  "bg-[#00ffea] hover:bg-[#00e6d1]",
                  "text-black font-semibold",
                  "shadow-[0_0_20px_rgba(0,255,234,0.3)]",
                  "hover:shadow-[0_0_30px_rgba(0,255,234,0.5)]",
                  "cursor-pointer",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
                style={{ pointerEvents: 'auto' }}
              >
                {isLoading ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
            {!CLERK_ENABLED && (
              <div className="mt-6 text-center">
                <p className="text-sm text-white/60">
                  Demo mode: Use any email and password to sign in
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
