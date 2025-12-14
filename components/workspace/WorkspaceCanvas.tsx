'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkspaceCanvasProps {
  className?: string
}

export default function WorkspaceCanvas({ className }: WorkspaceCanvasProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [hasContent, setHasContent] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    setHasContent(true)
    // Handle file drop
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[600px]",
        "rounded-lg border-2 border-dashed",
        "bg-[#0a0f15]/50 backdrop-blur-sm",
        isDragging
          ? "border-[#00ffea] bg-[#00ffea]/10"
          : "border-white/20 hover:border-[#00ffea]/50",
        "transition-all duration-300",
        "overflow-hidden",
        className
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {hasContent ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Play className="h-16 w-16 text-[#00ffea] mx-auto mb-4 drop-shadow-[0_0_20px_rgba(0,255,234,0.5)]" />
            <p className="text-white/60">Video Preview</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-6"
          >
            <Upload className="h-16 w-16 text-[#00ffea] drop-shadow-[0_0_20px_rgba(0,255,234,0.5)]" />
          </motion.div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Drop video or media here
          </h3>
          <p className="text-white/60 text-sm text-center max-w-md">
            Drag and drop your video files, or click to browse
          </p>
        </div>
      )}

      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-[#00ffea]/20 backdrop-blur-sm flex items-center justify-center"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-[#00ffea] mb-2 drop-shadow-[0_0_20px_rgba(0,255,234,0.8)]">
              Drop to upload
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

