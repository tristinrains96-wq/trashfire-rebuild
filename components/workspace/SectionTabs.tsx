'use client'

import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { FileText, Users, Image, Mic, Film, Music } from 'lucide-react'
import { useWorkspace } from '@/store/workspace'
import { useState, useCallback, useEffect } from 'react'
import { dur, ease } from '@/styles/motion'

interface SectionTabsProps {
  className?: string
}

const sections = [
  { key: 'script', label: 'Script', icon: FileText },
  { key: 'characters', label: 'Characters', icon: Users },
  { key: 'backgrounds', label: 'Backgrounds', icon: Image },
  { key: 'episode', label: 'Episode', icon: Music }
]

export default function SectionTabs({ className = "" }: SectionTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeSection, setSection } = useWorkspace()
  const [hoveredSection, setHoveredSection] = useState<string | null>(null)

  // Prefetch section panes on hover
  const prefetchSection = useCallback((sectionKey: string) => {
    // Dynamic import for prefetching
    switch (sectionKey) {
      case 'script':
        import('./panes/ScriptPane')
        break
      case 'characters':
        import('./panes/CharactersPane')
        break
      case 'backgrounds':
        import('./panes/BackgroundsPane')
        break
      case 'episode':
        import('./panes/EpisodePane')
        break
    }
  }, [])

  const handleSectionChange = (sectionKey: string) => {
    // Update the store
    setSection(sectionKey as any)
    
    // Update URL with shallow routing
    const params = new URLSearchParams(searchParams.toString())
    params.set('section', sectionKey)
    router.replace(`/workspace?${params.toString()}`, { scroll: false })
  }

// Initial sync on mount: ensure URL and store have a section
useEffect(() => {
  const params = new URLSearchParams(searchParams.toString())
  const current = params.get('section')
  if (!current) {
    params.set('section', activeSection || 'script')
    router.replace(`/workspace?${params.toString()}`, { scroll: false })
  } else if (current !== activeSection) {
    setSection(current as any)
  }
  // We intentionally run once on mount for initial sync
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])

  const handleMouseEnter = (sectionKey: string) => {
    setHoveredSection(sectionKey)
    prefetchSection(sectionKey)
  }

  const handleMouseLeave = () => {
    setHoveredSection(null)
  }

  return (
    <div className={`pointer-events-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: dur.base, ease: ease.standard }}
        className="flex items-center justify-center"
      >
        <div className="flex items-center gap-1">
          {sections.map((section, index) => {
            const isActive = activeSection === section.key
            const Icon = section.icon
            
            return (
              <motion.button
                key={section.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: dur.fast, 
                  delay: index * 0.05 
                }}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className={`
                  relative flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-md
                  transition-all duration-200 group
                  ${isActive 
                    ? 'text-white opacity-100' 
                    : 'text-white/70 hover:text-white/95'
                  }
                `}
                onClick={() => handleSectionChange(section.key)}
                onMouseEnter={() => handleMouseEnter(section.key)}
                onMouseLeave={handleMouseLeave}
                title={section.label}
              >
                <Icon className={`h-4 w-4 transition-all duration-200 ${
                  isActive ? 'scale-110' : 'group-hover:scale-105'
                }`} />
                <span className="text-sm md:text-base font-medium tracking-tight">{section.label}</span>
                
                {/* Active underline ink bar */}
                {isActive && (
                  <motion.div
                    layoutId="section-tabs-underline"
                    className="pointer-events-none absolute -bottom-px left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-300 to-teal-300 rounded-full shadow-[0_0_6px_rgba(0,255,200,0.35)]"
                    initial={false}
                    transition={{ duration: dur.base, ease: ease.empha }}
                  />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
