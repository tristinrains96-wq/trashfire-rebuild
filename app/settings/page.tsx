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
import { LogOut, Key, CreditCard, Moon, Sun, Save } from 'lucide-react'

export default function SettingsPage() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    stability: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    // In real app, save to backend
  }

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

        {/* API Keys Section */}
        <Card className={cn(
          "mb-6 bg-[#0a0f15]/80 backdrop-blur-sm",
          "border border-white/10"
        )}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-[#00ffea]" />
              <CardTitle className="text-white">API Keys</CardTitle>
            </div>
            <CardDescription className="text-white/60">
              Manage your API keys for external services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-white/80">OpenAI API Key</Label>
              <Input
                type="password"
                value={apiKeys.openai}
                onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                placeholder="sk-..."
                className={cn(
                  "mt-2 bg-black/30 border-white/10",
                  "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                  "text-white placeholder:text-white/40"
                )}
              />
            </div>
            <div>
              <Label className="text-white/80">Anthropic API Key</Label>
              <Input
                type="password"
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                placeholder="sk-ant-..."
                className={cn(
                  "mt-2 bg-black/30 border-white/10",
                  "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                  "text-white placeholder:text-white/40"
                )}
              />
            </div>
            <div>
              <Label className="text-white/80">Stability AI API Key</Label>
              <Input
                type="password"
                value={apiKeys.stability}
                onChange={(e) => setApiKeys({ ...apiKeys, stability: e.target.value })}
                placeholder="sk-..."
                className={cn(
                  "mt-2 bg-black/30 border-white/10",
                  "focus:border-[#00ffea] focus:ring-[#00ffea]/20",
                  "text-white placeholder:text-white/40"
                )}
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className={cn(
                "bg-[#00ffea] hover:bg-[#00e6d1]",
                "text-black font-semibold"
              )}
            >
              {isSaving ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save API Keys
                </>
              )}
            </Button>
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

