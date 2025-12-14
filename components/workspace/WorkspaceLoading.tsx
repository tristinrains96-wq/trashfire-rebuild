'use client'

import { motion } from 'framer-motion'

export default function WorkspaceLoading() {
  return (
    <div className="fixed inset-0 bg-[#07090a] z-50 flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#07090a] via-[#0a0f15] to-[#07090a]" />
      
      {/* Spinner with neon glow */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-[#00ffea]/20 border-t-[#00ffea] rounded-full"
          style={{
            boxShadow: '0 0 20px rgba(0, 255, 234, 0.5), 0 0 40px rgba(0, 255, 234, 0.3)'
          }}
        />
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-[#00ffea] text-sm font-medium tracking-wide"
          style={{
            textShadow: '0 0 10px rgba(0, 255, 234, 0.8), 0 0 20px rgba(0, 255, 234, 0.4)'
          }}
        >
          Loading studio...
        </motion.p>
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="absolute inset-0 opacity-50" 
        style={{ 
          background: 'radial-gradient(circle at center, rgba(0,255,234,0.1) 0%, transparent 70%)' 
        }} 
      />
    </div>
  )
}
