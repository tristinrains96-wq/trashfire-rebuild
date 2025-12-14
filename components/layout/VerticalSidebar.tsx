'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Users, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  Film, 
  Music, 
  Play,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useStudioStore } from '@/store/useStudioStore'
import { useWorkspace } from '@/store/workspace'

const navigationItems = [
  { 
    name: 'Characters', 
    href: '/workspace?section=characters', 
    icon: Users,
    color: 'text-blue-500',
    activeColor: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    glowColor: 'shadow-blue-500/20'
  },
  { 
    name: 'Script', 
    href: '/workspace?section=script', 
    icon: FileText,
    color: 'text-emerald-500',
    activeColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    glowColor: 'shadow-emerald-500/20'
  },
  { 
    name: 'Backgrounds', 
    href: '/workspace/backgrounds', 
    icon: ImageIcon,
    color: 'text-purple-500',
    activeColor: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    glowColor: 'shadow-purple-500/20'
  },
  { 
    name: 'Voices', 
    href: '/workspace/voices', 
    icon: Mic,
    color: 'text-orange-500',
    activeColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    glowColor: 'shadow-orange-500/20'
  },
  { 
    name: 'Scenes', 
    href: '/workspace/scenes', 
    icon: Film,
    color: 'text-rose-500',
    activeColor: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    glowColor: 'shadow-rose-500/20'
  },
  { 
    name: 'Music', 
    href: '/workspace/music', 
    icon: Music,
    color: 'text-indigo-500',
    activeColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    glowColor: 'shadow-indigo-500/20'
  },
  { 
    name: 'Episode', 
    href: '/workspace/episode', 
    icon: Play,
    color: 'text-teal-500',
    activeColor: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    glowColor: 'shadow-teal-500/20'
  },
]

interface VerticalSidebarProps {
  className?: string
}

export default function VerticalSidebar({ className = '' }: VerticalSidebarProps) {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const activePanel = useStudioStore((state) => state?.activePanel)
  const setActive = useStudioStore((state) => state?.setActive)
  const { activeSection, setSection } = useWorkspace()

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isActive = (href: string) => {
    const sectionKey = href.split('/').pop()
    return activeSection === sectionKey || activePanel === sectionKey || pathname.startsWith(href)
  }

  const handleItemClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault()
    const sectionKey = href.split('/').pop() as any
    setSection(sectionKey)
    setActive?.(sectionKey)
    if (isMobile) {
      setIsExpanded(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile && !isExpanded ? '-100%' : 0,
          width: isMobile ? '280px' : isExpanded ? '280px' : '80px'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`
          fixed left-0 top-0 z-50 h-full
          bg-background/95 backdrop-blur-xl
          border-r border-border/40
          ${isMobile ? 'shadow-2xl' : 'shadow-lg'}
          ${className}
        `}
      >
        {/* Mobile header */}
        {isMobile && (
          <div className="flex h-14 items-center justify-between border-b border-border/40 px-4">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={140}
              height={42}
              className="h-10 w-auto"
              priority
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Desktop expand/collapse button */}
        {!isMobile && (
          <div className="flex h-14 items-center justify-end border-b border-border/40 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Navigation items */}
        <nav className="flex flex-col gap-2 p-4">
          <TooltipProvider delayDuration={300}>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={`
                        group relative flex items-center gap-3 rounded-xl px-3 py-3
                        transition-all duration-200 hover:scale-105
                        ${active 
                          ? `${item.bgColor} ${item.activeColor} shadow-lg ${item.glowColor}` 
                          : `${item.color} hover:bg-muted/50`
                        }
                        ${isExpanded ? 'justify-start' : 'justify-center'}
                      `}
                      onClick={(e) => handleItemClick(item.href, e)}
                    >
                      <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'drop-shadow-sm' : ''}`} />
                      
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="font-medium text-sm whitespace-nowrap"
                        >
                          {item.name}
                        </motion.span>
                      )}

                      {/* Active indicator */}
                      {active && (
                        <motion.div
                          layoutId="activeIndicator"
                          className={`
                            absolute left-0 top-1/2 -translate-y-1/2
                            w-1 h-8 rounded-r-full
                            ${item.bgColor.replace('/10', '')}
                            shadow-sm
                          `}
                        />
                      )}

                      {/* Hover glow effect */}
                      {active && (
                        <motion.div
                          className={`
                            absolute inset-0 rounded-xl
                            ${item.bgColor}
                            opacity-20 blur-sm
                          `}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}
                    </Link>
                  </TooltipTrigger>
                  
                  {!isExpanded && (
                    <TooltipContent side="right" className="ml-2">
                      <p className="font-medium">{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>

        {/* Bottom section for additional items */}
        <div className="mt-auto p-4">
          <div className="border-t border-border/40 pt-4">
            {/* Add any additional navigation items here */}
          </div>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(true)}
          className="fixed left-4 top-4 z-40 h-10 w-10 lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  )
}
