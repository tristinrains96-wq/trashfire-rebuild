'use client'

import { ReactNode, useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useWorkspace } from '@/store/workspace'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useScriptEntityDetector } from '@/hooks/useScriptEntityDetector'

// Lazy-loaded section panes
const ScriptPane = dynamic(() => import('./panes/ScriptPane'), { 
  ssr: false, 
  loading: () => <SectionSkeleton />
})
const CharactersPane = dynamic(() => import('./panes/CharactersPane'), { 
  ssr: false, 
  loading: () => <SectionSkeleton />
})
const BackgroundsPane = dynamic(() => import('./panes/BackgroundsPane'), { 
  ssr: false, 
  loading: () => <SectionSkeleton />
})
const VoicesPane = dynamic(() => import('./panes/VoicesPane'), { 
  ssr: false, 
  loading: () => <SectionSkeleton />
})
const ScenesPane = dynamic(() => import('./panes/ScenesPane'), { 
  ssr: false, 
  loading: () => <SectionSkeleton />
})
const EpisodePane = dynamic(() => import('./panes/EpisodePane'), { 
  ssr: false, 
  loading: () => <SectionSkeleton />
})

interface GenBoxProps {
  children?: ReactNode
  className?: string
}

// Section title mapping
const sectionTitles = {
  script: 'Script Lab',
  characters: 'Character Studio', 
  backgrounds: 'Background Design',
  voices: 'Voice Casting',
  scenes: 'Scene Builder',
  episode: 'Episode Preview'
}

// Status dot component
function StatusDot({ status, progress }: { status: 'ready' | 'busy' | 'error', progress?: number | null }) {
  const getStatusColor = () => {
    switch (status) {
      case 'ready': return 'bg-green-500'
      case 'busy': return 'bg-yellow-500'
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = () => {
    if (status === 'busy' && progress !== null) {
      return `Processing... ${progress}%`
    }
    switch (status) {
      case 'ready': return 'Ready'
      case 'busy': return 'Processing...'
      case 'error': return 'Error occurred'
      default: return 'Unknown'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'busy' ? 'animate-pulse' : ''}`} />
            {status === 'busy' && progress !== null && (
              <div className="w-8 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-yellow-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Loading skeleton for sections
function SectionSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-400 mx-auto mb-4"></div>
      <p className="text-white/60 text-sm">Loading section...</p>
    </div>
  )
}

export default function GenBox({ children, className = "" }: GenBoxProps) {
  const [isClient, setIsClient] = useState(false)
  const { activeSection, project, status, taskProgress } = useWorkspace()
  const { detectEntities } = useScriptEntityDetector()
  
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Set up entity detection for script section
  useEffect(() => {
    if (activeSection === 'script' && isClient) {
      // Pre-warm the entity detector
      detectEntities('Sample text for warming up the worker')
    }
  }, [activeSection, isClient, detectEntities])
  
  // Section content mapping
  const sectionContent = {
    script: <ScriptPane />,
    characters: <CharactersPane />,
    backgrounds: <BackgroundsPane />,
    voices: <VoicesPane />,
    scenes: <ScenesPane />,
    episode: <EpisodePane />
  }

  const currentContent = isClient 
    ? (sectionContent[activeSection as keyof typeof sectionContent] || <CharactersPane />)
    : <SectionSkeleton />

  return (
    <motion.div 
      className="flex justify-center py-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className={`relative mx-auto w-full max-w-[1100px] min-h-[560px] rounded-3xl border border-white/8 bg-[#0c1016]/80 backdrop-blur-md shadow-[0_0_60px_-18px_rgba(0,255,200,0.24)] px-6 sm:px-8 py-8 ${className}`}>
        {/* Header with Logo and Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={24}
              height={24}
              className="h-6 w-auto opacity-80 hover:opacity-100 transition-opacity"
              priority
            />
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span className="font-medium">{project.title}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/40">Episode {project.episodeNumber}</span>
              <span className="text-white/40">/</span>
              <span className="font-medium">
                {isClient ? sectionTitles[activeSection] : 'Loading...'}
              </span>
            </div>
          </div>
          <StatusDot status={status} progress={taskProgress} />
        </div>

        {/* Body - Section Content */}
        <div className="relative min-h-[400px]">
          <Suspense fallback={<SectionSkeleton />}>
            {children || currentContent}
          </Suspense>
        </div>
      </section>
    </motion.div>
  )
}
