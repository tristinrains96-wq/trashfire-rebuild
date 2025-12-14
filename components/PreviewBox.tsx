'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Square, ChevronLeft, ChevronRight, Film, Mic, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type TurntableAngle = 'front' | '3/4' | 'side' | '3/4-back' | 'back'
type PreviewState = 'idle' | 'ready' | 'rendering'

interface PreviewBoxProps {
  state?: PreviewState
  turntableAngle?: TurntableAngle
  onPose?: () => void
  onLipSync?: () => void
  onOpenDNA?: () => void
  onTurntableChange?: (angle: TurntableAngle) => void
  children?: React.ReactNode
}

const turntableAngles: TurntableAngle[] = ['front', '3/4', 'side', '3/4-back', 'back']

export default function PreviewBox({ 
  state = 'idle', 
  turntableAngle = 'front',
  onPose,
  onLipSync,
  onOpenDNA,
  onTurntableChange,
  children
}: PreviewBoxProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; angle: TurntableAngle } | null>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        rotateTurntable(-1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        rotateTurntable(1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const rotateTurntable = (direction: number) => {
    const currentIndex = turntableAngles.indexOf(turntableAngle)
    const nextIndex = (currentIndex + direction + turntableAngles.length) % turntableAngles.length
    const nextAngle = turntableAngles[nextIndex]
    onTurntableChange?.(nextAngle)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, angle: turntableAngle })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart) return
    
    const deltaX = e.clientX - dragStart.x
    const threshold = 50
    
    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? 1 : -1
      rotateTurntable(direction)
      setDragStart({ x: e.clientX, angle: turntableAngle })
    }
  }

  const handleMouseUp = () => {
    setDragStart(null)
  }

  const renderIdleState = () => (
    <div className="flex flex-col items-center justify-center h-full w-full text-center">
      <motion.div
        className="mb-4"
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
        <Image
          src="/trashfire-logo.png"
          alt="TrashFire"
          width={120}
          height={36}
          className="h-20 w-auto"
        />
      </motion.div>
      <p className="text-text-secondary text-lg">TrashFire Character</p>
      <p className="text-text-disabled text-sm mt-1">Generate your first character</p>
    </div>
  )

  const renderOverlayButtons = () => (
    <AnimatePresence>
      {isHovered && state === 'ready' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 flex gap-2 pointer-events-auto"
        >
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onPose}
            aria-label="Pose"
          >
            <Film className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onLipSync}
            aria-label="Lip Sync"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={onOpenDNA}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex justify-center py-8">
      <div className="container-hero">
        <div 
          className="relative w-full overflow-hidden rounded-[28px] bg-surface shadow-glow hover:shadow-[0_0_25px_rgba(0,245,212,0.4)] transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false)
            setDragStart(null)
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {children ? (
            <div className="flex flex-col gap-3 p-6">
              {children}
            </div>
          ) : (
            <div className="relative aspect-video h-full w-full">
              {state === 'idle' ? (
                renderIdleState()
              ) : (
                <>
                  <img
                    src="/mock/preview.svg"
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  {/* Subtle scanline texture */}
                  <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
                       style={{
                         backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,245,212,0.1) 1px, rgba(0,245,212,0.1) 2px)',
                         backgroundSize: '100% 4px'
                       }} />
                  
                  {/* Rendering state */}
                  {state === 'rendering' && (
                    <div className="absolute inset-0 shimmer bg-accent/10" />
                  )}
                  
                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="h-16 w-16 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Square className="h-6 w-6" />
                      ) : (
                        <Play className="h-6 w-6 ml-1" />
                      )}
                    </Button>
                  </div>
                </>
              )}
              
              {/* Hover zones for turntable */}
              <div className="absolute inset-0 pointer-events-none">
                <button 
                  aria-label="Rotate left"
                  className="pointer-events-auto absolute inset-y-0 left-0 w-1/6 opacity-0 hover:opacity-100 transition-opacity duration-200 grid place-items-center"
                  onClick={() => rotateTurntable(-1)}
                >
                  <ChevronLeft className="text-text-secondary/70" />
                </button>
                <button 
                  aria-label="Rotate right"
                  className="pointer-events-auto absolute inset-y-0 right-0 w-1/6 opacity-0 hover:opacity-100 transition-opacity duration-200 grid place-items-center"
                  onClick={() => rotateTurntable(1)}
                >
                  <ChevronRight className="text-text-secondary/70" />
                </button>
              </div>

              {/* Overlay buttons */}
              {renderOverlayButtons()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
