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
import { useAuth } from '@/store/auth'
import { Sparkles } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      router.push(redirect)
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        const redirect = searchParams.get('redirect') || '/dashboard'
        router.push(redirect)
      } else {
        setError('Invalid credentials')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#07090a] relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,234,0.1)_0%,transparent_60%)]" />
        <div className="absolute left-1/2 top-1/2 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,rgba(0,255,200,0.03),transparent_30%)] blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 px-6 py-6">
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
        className="w-full max-w-md px-6"
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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
                className={cn(
                  "w-full",
                  "bg-[#00ffea] hover:bg-[#00e6d1]",
                  "text-black font-semibold",
                  "shadow-[0_0_20px_rgba(0,255,234,0.3)]",
                  "hover:shadow-[0_0_30px_rgba(0,255,234,0.5)]"
                )}
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
            <div className="mt-6 text-center">
              <p className="text-sm text-white/60">
                Demo mode: Use any email and password to sign in
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

