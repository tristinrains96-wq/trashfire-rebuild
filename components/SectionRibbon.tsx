'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Section {
  key: string
  label: string
}

interface SectionRibbonProps {
  sections: Section[]
  activeKey: string
  onChange: (key: string) => void
}

export default function SectionRibbon({ sections, activeKey, onChange }: SectionRibbonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Auto-scroll to active item on mobile
  useEffect(() => {
    if (!isMobile || !containerRef.current) return

    const activeElement = containerRef.current.querySelector(`[data-key="${activeKey}"]`) as HTMLElement
    if (activeElement) {
      activeElement.scrollIntoView({ 
        behavior: 'smooth', 
        inline: 'center', 
        block: 'nearest' 
      })
    }
  }, [activeKey, isMobile])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = sections.findIndex(section => section.key === activeKey)
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : sections.length - 1
        onChange(sections[prevIndex].key)
        break
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0
        onChange(sections[nextIndex].key)
        break
      case 'Home':
        e.preventDefault()
        onChange(sections[0].key)
        break
      case 'End':
        e.preventDefault()
        onChange(sections[sections.length - 1].key)
        break
    }
  }

  const renderSection = (section: Section) => {
    const isActive = section.key === activeKey
    
    return (
      <button
        key={section.key}
        data-key={section.key}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${section.key}`}
        className={`
          relative inline-flex items-center justify-center select-none transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background
          ${isMobile 
            ? 'flex-none px-5 py-3 text-xl font-semibold min-h-[44px]' 
            : 'px-4 py-2 text-3xl font-semibold min-h-[44px]'
          }
        `}
        onClick={() => onChange(section.key)}
      >
        <span className="relative">
          <span
            className={`
              transition-all duration-200 ease-out
              ${isActive 
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-400 drop-shadow-[0_0_8px_rgba(0,245,212,0.3)] scale-[1.03]' 
                : 'text-gray-400/70 hover:text-gray-200/90'
              }
            `}
          >
            {section.label}
          </span>
          
          {/* Active underline for desktop */}
          {isActive && !isMobile && (
            <motion.div
              layoutId="ribbon-underline"
              className="absolute -bottom-1 h-[3px] w-full rounded-full bg-gradient-to-r from-teal-300 to-cyan-400"
              initial={false}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
            />
          )}
        </span>
      </button>
    )
  }

  if (isMobile) {
    return (
      <div 
        className="fixed bottom-[calc(env(safe-area-inset-bottom)+var(--kb-offset,64px))] left-0 right-0 z-40"
        style={{
          backdropFilter: 'blur(12px)',
          background: 'rgba(0, 0, 0, 0.4)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Gradient edge fade masks */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(0, 0, 0, 0.4), transparent)'
          }}
        />
        <div 
          className="absolute right-0 top-0 bottom-0 w-8 pointer-events-none"
          style={{
            background: 'linear-gradient(to left, rgba(0, 0, 0, 0.4), transparent)'
          }}
        />
        
        <div
          ref={containerRef}
          className="flex gap-2 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 py-3"
          role="tablist"
          aria-label="Workspace sections"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {sections.map(renderSection)}
        </div>
      </div>
    )
  }

  // Desktop layout - non-sticky, centered under Preview
  return (
    <div className="w-full max-w-[1100px] mx-auto px-4">
      <div
        ref={containerRef}
        className="flex items-center justify-center gap-10"
        role="tablist"
        aria-label="Workspace sections"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {sections.map(renderSection)}
      </div>
    </div>
  )
}
