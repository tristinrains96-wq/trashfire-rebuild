'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { useScriptAI } from '@/hooks/useScriptAI'
import ChatThread from './ChatThread'

export default function ScriptLab() {
  const { messages, isProcessing } = useScriptAI()
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  return (
    <div className="h-[50vh] md:h-[58vh] overflow-hidden">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center text-center mt-[15vh] mb-8"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-4xl mb-2 text-teal-400"
          onMouseMove={(e) => setOffset({ 
            x: e.clientX / window.innerWidth - 0.5, 
            y: e.clientY / window.innerHeight - 0.5 
          })}
          style={{ 
            transform: `translate(${offset.x * 8}px, ${offset.y * 8}px)` 
          }}
        >
          🤖
        </motion.div>
        <h1 className="text-[28px] font-semibold text-white">Script Lab — Your AI Co-Writer</h1>
        <p className="text-[16px] text-zinc-400 mt-1">Chat naturally. I&apos;ll plan your episode and prepare assets for you.</p>
      </motion.div>

      {/* Chat Interface */}
      <div className="w-full h-full bg-background border border-teal-500/20 rounded-lg overflow-hidden shadow-lg shadow-teal-500/10">
        {/* Chat thread only - no input */}
        <div className="h-full overflow-y-auto">
          <ChatThread messages={messages} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  )
}
