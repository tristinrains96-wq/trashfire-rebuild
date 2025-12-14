'use client'

import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useWorkspace } from '@/store/workspace'
import { dur, ease } from '@/styles/motion'

interface GenBoxProps {
  children?: ReactNode
  title?: string
  context?: string
  status?: 'idle' | 'ready' | 'rendering' | 'error'
  className?: string
}

export default function GenBox({ 
  children, 
  title = "TrashFire Studio",
  context,
  status = 'idle',
  className = ""
}: GenBoxProps) {
  const [isClient, setIsClient] = useState(false)
  const { activeSection: workspaceSection } = useWorkspace()
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  // Map section to display names
  const sectionNames: Record<string, string> = {
    script: 'Script Lab',
    characters: 'Character Studio',
    backgrounds: 'Background Studio',
    voices: 'Voice Studio',
    scenes: 'Scene Studio',
    episode: 'Episode Studio'
  }

  return (
    <motion.div 
      className="flex justify-center py-8"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: dur.base, ease: ease.standard }}
    >
      <section className={`relative mx-auto w-full max-w-[1100px] min-h-[560px] rounded-3xl border border-white/8 bg-[#0c1016]/80 backdrop-blur-md shadow-[0_0_60px_-18px_rgba(0,255,200,0.24)] px-6 sm:px-8 py-8 ${className}`}>
        {/* Unified Header with Logo and Section */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Image
              src="/trashfire-logo.png"
              alt="TrashFire"
              width={120}
              height={36}
              className="h-8 w-auto"
              priority
            />
            <div className="h-6 w-px bg-white/20"></div>
            <h1 className="text-lg font-medium text-white/80 capitalize">
              {isClient ? (sectionNames[workspaceSection] || context || title) : (context || title)}
            </h1>
          </div>
        </div>

        {/* Body - message stream with preview blocks */}
        <div className="relative min-h-[400px]">
          {children ? (
            <div className="h-full">
              {children}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <motion.div
                className="mb-6"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
                </div>
              </motion.div>
              <h2 className="text-xl font-semibold tracking-tight text-white mb-2">Ready to Create</h2>
              <p className="text-white/60 text-sm max-w-md">
                Start by describing your story, characters, or world. I&apos;ll help you bring it to life.
              </p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  )
}
