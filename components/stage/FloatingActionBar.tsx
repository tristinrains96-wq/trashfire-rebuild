'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  FileText, 
  Users, 
  Image, 
  Mic, 
  Film, 
  Music,
  Plus,
  Wand2,
  Eye,
  Download,
  Play,
  Settings,
  Zap
} from 'lucide-react'

interface FloatingActionBarProps {
  context: string
  className?: string
}

interface PageAction {
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  variant?: 'primary' | 'secondary'
}

export default function FloatingActionBar({ context, className = "" }: FloatingActionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getPageActions = (context: string): PageAction[] => {
    switch (context) {
      case 'script':
        return [
          {
            label: 'Refine Outline',
            icon: FileText,
            action: () => console.log('Refine Outline'),
            variant: 'primary'
          },
          {
            label: 'Detect Entities',
            icon: Zap,
            action: () => console.log('Detect Entities'),
            variant: 'secondary'
          }
        ]
      case 'characters':
        return [
          {
            label: 'Generate Turntable',
            icon: Users,
            action: () => console.log('Generate Turntable'),
            variant: 'primary'
          },
          {
            label: 'Lock Consistency',
            icon: Settings,
            action: () => console.log('Lock Consistency'),
            variant: 'secondary'
          }
        ]
      case 'backgrounds':
        return [
          {
            label: 'Generate Set',
            icon: Image,
            action: () => console.log('Generate Set'),
            variant: 'primary'
          },
          {
            label: 'Import Reference',
            icon: Plus,
            action: () => console.log('Import Reference'),
            variant: 'secondary'
          }
        ]
      case 'voices':
        return [
          {
            label: 'Browse Voices',
            icon: Mic,
            action: () => console.log('Browse Voices'),
            variant: 'primary'
          },
          {
            label: 'Auto-Match',
            icon: Wand2,
            action: () => console.log('Auto-Match'),
            variant: 'secondary'
          }
        ]
      case 'scenes':
        return [
          {
            label: 'Build Storyboard',
            icon: Film,
            action: () => console.log('Build Storyboard'),
            variant: 'primary'
          },
          {
            label: 'Preview Cut',
            icon: Play,
            action: () => console.log('Preview Cut'),
            variant: 'secondary'
          }
        ]
      case 'episode':
        return [
          {
            label: 'Build Preview',
            icon: Music,
            action: () => console.log('Build Preview'),
            variant: 'primary'
          },
          {
            label: 'Export',
            icon: Download,
            action: () => console.log('Export'),
            variant: 'secondary'
          }
        ]
      default:
        return []
    }
  }

  const getContextIcon = (context: string) => {
    switch (context) {
      case 'script': return FileText
      case 'characters': return Users
      case 'backgrounds': return Image
      case 'voices': return Mic
      case 'scenes': return Film
      case 'episode': return Music
      default: return Plus
    }
  }

  const actions = getPageActions(context)
  const MainIcon = getContextIcon(context)

  if (actions.length === 0) return null

  return (
    <div className={`fixed right-6 bottom-[calc(68px+theme(spacing.6))] z-40 ${className}`}>
      <div className="flex flex-col items-end gap-3">
        {/* Action buttons */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.8 }}
              transition={{ duration: 0.2, staggerChildren: 0.1 }}
              className="flex flex-col gap-2"
            >
              {actions.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium bg-white/10 text-white/90 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all duration-200"
                  >
                    <Icon className="h-3 w-3" />
                    <span>{action.label}</span>
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-12 h-12 rounded-full flex items-center justify-center text-white bg-gradient-to-r from-teal-500/80 to-cyan-500/80 hover:from-teal-500 hover:to-cyan-500 backdrop-blur-sm border border-white/20 transition-all duration-200 shadow-lg"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MainIcon className="h-5 w-5" />
          </motion.div>
        </motion.button>
      </div>
    </div>
  )
}