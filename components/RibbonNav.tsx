'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface RibbonNavProps {
  items: { id: string; label: string }[]
  activeId: string
  onChange: (id: string) => void
}

export default function RibbonNav({ items, activeId, onChange }: RibbonNavProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  // Auto-center active item when it changes (mobile only)
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const activeElement = container.querySelector(`[data-id="${activeId}"]`) as HTMLElement
    if (activeElement && window.matchMedia('(max-width:1023px)').matches) {
      activeElement.scrollIntoView({ 
        behavior: 'smooth', 
        inline: 'center', 
        block: 'nearest' 
      })
    }
  }, [activeId])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = items.findIndex(item => item.id === activeId)
    
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        onChange(items[prevIndex].id)
        setFocusedIndex(prevIndex)
        break
      case 'ArrowRight':
        e.preventDefault()
        const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        onChange(items[nextIndex].id)
        setFocusedIndex(nextIndex)
        break
      case 'Home':
        e.preventDefault()
        onChange(items[0].id)
        setFocusedIndex(0)
        break
      case 'End':
        e.preventDefault()
        onChange(items[items.length - 1].id)
        setFocusedIndex(items.length - 1)
        break
    }
  }

  const renderNavItem = (item: { id: string; label: string }, index: number) => {
    const isActive = item.id === activeId
    
    return (
      <button
        key={item.id}
        data-id={item.id}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${item.id}`}
        className="relative inline-flex items-center justify-center px-2 select-none transition-transform tracking-wide leading-tight hover:scale-[1.04] focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        onClick={() => onChange(item.id)}
        style={{
          minHeight: '44px', // Ensure tap targets are ≥44px
        }}
      >
        <span className="relative">
          <span
            className={`
              text-[clamp(20px,3.2vw,28px)] lg:text-[clamp(28px,2.2vw,40px)]
              font-bold whitespace-nowrap lg:whitespace-normal tracking-wide
              transition-all duration-300 ease-out
              ${isActive 
                ? 'text-transparent bg-clip-text bg-[image:var(--tf-grad-accent)] drop-shadow-[0_0_14px_rgba(0,245,212,.25)]' 
                : 'text-[#9AA4A8] opacity-70 hover:opacity-90'
              }
            `}
          >
            {item.label}
          </span>
          
          {/* Active underline */}
          {isActive && (
            <motion.div
              layoutId="ribbon-underline"
              className="absolute -bottom-2 h-[3px] w-full rounded-full bg-[image:var(--tf-grad-accent)]"
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
    <section
      className="
        w-screen relative left-1/2 right-1/2 -mx-[50vw]
        px-4 lg:px-6 py-2 lg:py-3
        bg-transparent
      "
    >
      {/* Optional ribbon backdrop */}
      <div className="ribbon-backdrop hidden lg:block" />
      
      {/* Layer 2: inner layout that controls distribution */}
      <div
        ref={containerRef}
        className="
          mx-auto w-full
          /* MOBILE/TABLET: horizontal scroll row */
          flex gap-6 overflow-x-auto scrollbar-none whitespace-nowrap items-center justify-start
          /* DESKTOP+: evenly distribute each item as equal columns using grid-flow-col */
          lg:grid lg:grid-flow-col lg:auto-cols-fr lg:gap-2 lg:overflow-visible lg:whitespace-normal lg:justify-normal
        "
        role="tablist"
        aria-label="Workspace sections"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {items.map((item, index) => renderNavItem(item, index))}
      </div>
    </section>
  )
}
