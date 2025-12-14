'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface Section {
  key: string
  label: string
}

interface NavRibbonProps {
  sections: Section[]
  activeKey: string
  onChange: (key: string) => void
}

export default function NavRibbon({ sections, activeKey, onChange }: NavRibbonProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to active item
  useEffect(() => {
    if (!containerRef.current) return

    const activeElement = containerRef.current.querySelector(`[data-key="${activeKey}"]`) as HTMLElement
    if (activeElement) {
      activeElement.scrollIntoView({ 
        behavior: 'smooth', 
        inline: 'center', 
        block: 'nearest' 
      })
    }
  }, [activeKey])

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
          whitespace-nowrap text-lg md:text-xl px-3 py-1.5 rounded-xl transition hover:opacity-90
        `}
        onClick={() => onChange(section.key)}
      >
        <span className="relative">
          <span
            className={`
              transition-all duration-200 ease-out
              ${isActive 
                ? 'bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(0,245,212,0.3)]' 
                : 'text-gray-400/70 hover:text-gray-200/90'
              }
            `}
          >
            {section.label}
          </span>
          
          {/* Active underline */}
          {isActive && (
            <motion.div
              layoutId="ribbon-underline"
              className="absolute -bottom-1 h-[2px] w-full rounded-full bg-gradient-to-r from-teal-300 to-cyan-400"
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

  return (
    <div className="rounded-2xl bg-[#0b0e10]/80 backdrop-blur border border-teal-900/30 shadow-[0_0_60px_-20px_rgba(0,255,200,0.25)] px-3 py-2 overflow-x-auto no-scrollbar">
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto scrollbar-none"
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
