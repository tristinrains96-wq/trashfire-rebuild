'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { LogOut, Key, CreditCard, Moon, Sun, Shield } from 'lucide-react'

// Check if Clerk is enabled to determine correct sign-in URL
const CLERK_ENABLED = !!(
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== 'pk_test_...'
)

const getSignInUrl = () => CLERK_ENABLED ? '/sign-in' : '/login'

// Demo mode - no admin checks

export default function SettingsPage() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(getSignInUrl())
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Demo mode - no save functionality

  return (
    <div className="min-h-screen bg-[#07090a]">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-[#0a0f15]/95 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={160}
              height={48}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white/80 hover:text-white">
                Dashboard
              </Button>
            </Link>
            <Link href="/workspace">
              <Button variant="ghost" className="text-white/80 hover:text-white">
                Workspace
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/60">Manage your account and preferences</p>
        </div>

        {/* Account Section */}
        <Card className={cn(
          "mb-6 bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
            <CardDescription className="text-white/60">
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                value={user?.email || ''}
                disabled
                className={cn(
                  "mt-2 bg-black/30 border-white/10",
                  "text-white/60"
                )}
              />
            </div>
            <div>
              <Label className="text-white/80">Name</Label>
              <Input
                value={user?.name || ''}
                disabled
                className={cn(
                  "mt-2 bg-black/30 border-white/10",
                  "text-white/60"
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className={cn(
          "mb-6 bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <CardTitle className="text-white">Appearance</CardTitle>
            <CardDescription className="text-white/60">
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-[#00ffea]" />
                ) : (
                  <Sun className="h-5 w-5 text-[#00ffea]" />
                )}
                <div>
                  <Label className="text-white/80">Dark Mode</Label>
                  <p className="text-sm text-white/60">Use dark theme</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-[#00ffea]"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Keys Section - Disabled in Demo Mode */}
        <Card className={cn(
          "mb-6 bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-[#00ffea]" />
              <CardTitle className="text-white">Provider Connections</CardTitle>
            </div>
            <CardDescription className="text-white/60">
              Demo Mode: API key management is disabled. Production uses secure backend keys stored server-side.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Shield className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-blue-400">Demo Mode Active</p>
                <p className="text-xs text-blue-300/70 mt-1">
                  This is a UI-only demo branch. API key management is not available.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Billing Section */}
        <Card className={cn(
          "mb-6 bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-[#00ffea]" />
              <CardTitle className="text-white">Billing</CardTitle>
            </div>
            <CardDescription className="text-white/60">
              Manage your subscription and payment methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 mb-2">Billing coming soon</p>
              <p className="text-white/40 text-sm">Payment integration will be available in a future update</p>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className={cn(
          "bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-red-500/20"
        )}>
          <CardContent className="pt-6">
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

