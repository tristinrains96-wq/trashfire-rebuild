'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Zap } from 'lucide-react'

interface ProModeToggleProps {
  className?: string
}

export default function ProModeToggle({ className = "" }: ProModeToggleProps) {
  const [isProMode, setIsProMode] = useState(false)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsProMode(!isProMode)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
          isProMode 
            ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/30' 
            : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
        }`}
      >
        {isProMode ? (
          <>
            <Zap className="h-3 w-3" />
            <span>Pro Mode</span>
          </>
        ) : (
          <>
            <Settings className="h-3 w-3" />
            <span>Settings</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
