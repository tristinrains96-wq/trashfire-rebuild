'use client'
import { motion } from 'framer-motion'

export default function BackgroundFX() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,204,0.1)_0%,transparent_60%)]"
        animate={{ opacity: [0.6, 0.8, 0.6] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-[200vh] w-[200vw] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_180deg,rgba(0,255,200,0.03),transparent_30%)] blur-3xl"
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}
