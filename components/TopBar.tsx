'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MoreHorizontal, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ProModeToggle from '@/components/ProModeToggle'
import Image from 'next/image'
import { useAuth } from '@/store/auth'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function TopBar() {
  const { isAuthenticated, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0f15]/95 backdrop-blur-xl" style={{ position: 'relative', zIndex: 10 }}>
      <div className="container flex h-14 max-w-screen-2xl items-center px-6">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={160}
              height={48}
              className="h-6 md:h-7 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-2">
              <Link href="/dashboard">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-white/80 hover:text-white",
                    pathname === '/dashboard' && "text-[#00ffea]"
                  )}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href="/workspace">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "text-white/80 hover:text-white",
                    pathname?.startsWith('/workspace') && "text-[#00ffea]"
                  )}
                >
                  Workspace
                </Button>
              </Link>
            </nav>
          )}
          <div className="flex items-center gap-3">
            <ProModeToggle />
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <div className="h-8 w-8 rounded-full bg-[#00ffea]/20 flex items-center justify-center border border-[#00ffea]/30">
                      <span className="text-[#00ffea] text-sm font-medium">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#0a0f15] border-white/10">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-white/60">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer text-white/80 hover:text-white">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400 hover:text-red-300">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button variant="ghost" className="text-white/80 hover:text-white">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
