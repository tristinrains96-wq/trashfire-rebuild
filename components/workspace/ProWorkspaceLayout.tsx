'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Layout, FolderTree, Eye, Clock, MessageSquare } from 'lucide-react'
import { useWorkspace } from '@/store/workspace'
import { cn } from '@/lib/utils'

interface ProWorkspaceLayoutProps {
  children?: ReactNode
  leftPanel?: ReactNode
  rightPanel?: ReactNode
  centerContent?: ReactNode
}

type MobileTab = 'canvas' | 'tree' | 'inspector' | 'timeline' | 'chat'

export default function ProWorkspaceLayout({
  children,
  leftPanel,
  rightPanel,
  centerContent,
}: ProWorkspaceLayoutProps) {
  const [leftCollapsed, setLeftCollapsed] = useState(true)
  const [rightCollapsed, setRightCollapsed] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<MobileTab>('canvas')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const panelTransition = { duration: 0.3, ease: 'easeInOut' }
  const panelWidth = 280
  const collapsedWidth = 48

  // Mobile tabs
  const mobileTabs: { key: MobileTab; label: string; icon: typeof Layout }[] = [
    { key: 'canvas', label: 'Canvas', icon: Layout },
    { key: 'tree', label: 'Tree', icon: FolderTree },
    { key: 'inspector', label: 'Inspector', icon: Eye },
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'chat', label: 'Chat', icon: MessageSquare },
  ]

  if (isMobile) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px)] bg-background overflow-hidden mt-14">
        {/* Main content area */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeMobileTab === 'canvas' && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={panelTransition}
                className="absolute inset-0 overflow-auto"
              >
                {centerContent || children}
              </motion.div>
            )}
            {activeMobileTab === 'tree' && leftPanel && (
              <motion.div
                key="tree"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={panelTransition}
                className="absolute inset-0 overflow-auto"
              >
                {leftPanel}
              </motion.div>
            )}
            {activeMobileTab === 'inspector' && rightPanel && (
              <motion.div
                key="inspector"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={panelTransition}
                className="absolute inset-0 overflow-auto"
              >
                {rightPanel}
              </motion.div>
            )}
            {activeMobileTab === 'timeline' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={panelTransition}
                className="absolute inset-0 overflow-auto p-4"
              >
                <div className="text-white/60 text-center">Timeline View</div>
              </motion.div>
            )}
            {activeMobileTab === 'chat' && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={panelTransition}
                className="absolute inset-0 overflow-auto p-4"
              >
                <div className="text-white/60 text-center">Chat View</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile bottom tabs */}
        <div className="h-16 bg-[#0a0f15]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around safe-area-bottom z-50">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeMobileTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveMobileTab(tab.key)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all",
                  isActive
                    ? "text-[#00ffea]"
                    : "text-white/40 hover:text-white/60"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-all",
                  isActive && "drop-shadow-[0_0_8px_rgba(0,255,234,0.5)]"
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive && "text-[#00ffea]"
                )}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className="flex h-[calc(100vh-56px)] bg-background overflow-hidden mt-14" style={{ zIndex: 1 }}>
      {/* Left Panel */}
      {leftPanel && (
        <motion.aside
          animate={{
            width: leftCollapsed ? collapsedWidth : panelWidth,
          }}
          transition={panelTransition}
          className={cn(
            "relative flex-shrink-0 h-full",
            "bg-[#0a0f15]/95 backdrop-blur-xl",
            "border-r border-white/10",
            "shadow-[0_0_40px_rgba(0,255,234,0.1)]",
            "glow-[0_0_20px_rgba(0,255,234,0.3)]",
            "overflow-hidden z-20"
          )}
        >
          <div className="h-full flex">
            <div className={cn(
              "flex-1 overflow-auto",
              leftCollapsed && "opacity-0 pointer-events-none"
            )}>
              {leftPanel}
            </div>
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className={cn(
                "w-12 h-12 flex items-center justify-center",
                "bg-black/30 hover:bg-black/50",
                "border-l border-white/10",
                "transition-all",
                "text-white/60 hover:text-[#00ffea]",
                "hover:shadow-[0_0_12px_rgba(0,255,234,0.3)]"
              )}
            >
              {leftCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </motion.aside>
      )}

      {/* Center Canvas - 85% width (responsive) */}
      <main className="flex-1 min-w-0 overflow-hidden relative">
        <div className="absolute inset-0 overflow-auto scrollbar-hide">
          <div className="w-full max-w-full md:max-w-[90%] lg:max-w-[85%] xl:max-w-[85%] mx-auto h-full px-2 sm:px-4">
            {centerContent || children}
          </div>
        </div>
      </main>

      {/* Right Panel */}
      {rightPanel && (
        <motion.aside
          animate={{
            width: rightCollapsed ? collapsedWidth : panelWidth,
          }}
          transition={panelTransition}
          className={cn(
            "relative flex-shrink-0 h-full",
            "bg-[#0a0f15]/95 backdrop-blur-xl",
            "border-l border-white/10",
            "shadow-[0_0_40px_rgba(0,255,234,0.1)]",
            "glow-[0_0_20px_rgba(0,255,234,0.3)]",
            "overflow-hidden z-20"
          )}
        >
          <div className="h-full flex">
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className={cn(
                "w-12 h-12 flex items-center justify-center",
                "bg-black/30 hover:bg-black/50",
                "border-r border-white/10",
                "transition-all",
                "text-white/60 hover:text-[#00ffea]",
                "hover:shadow-[0_0_12px_rgba(0,255,234,0.3)]"
              )}
            >
              {rightCollapsed ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
            <div className={cn(
              "flex-1 overflow-auto",
              rightCollapsed && "opacity-0 pointer-events-none"
            )}>
              {rightPanel}
            </div>
          </div>
        </motion.aside>
      )}
    </div>
  )
}

