'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { Bot, User } from 'lucide-react'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  preview?: ReactNode
  suggestions?: Array<{
    id: string
    title: string
    onAction: () => void
  }>
}

export default function ChatMessage({ 
  role, 
  text, 
  timestamp, 
  preview,
  suggestions = []
}: ChatMessageProps) {
  const isUser = role === 'user'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-gradient-to-br from-teal-400 to-cyan-500' 
          : 'bg-gradient-to-br from-gray-600 to-gray-700'
      }`}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Message bubble */}
        <div className={`inline-block px-4 py-3 rounded-2xl ${
          isUser 
            ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
            : 'bg-white/10 text-white border border-white/20'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
        </div>

        {/* Preview block (inline) */}
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="mt-3"
          >
            {preview}
          </motion.div>
        )}

        {/* Suggestions (inline chips) */}
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={suggestion.onAction}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/10 text-white/90 hover:bg-white/20 border border-white/20 transition-all duration-200"
              >
                <span>✨</span>
                <span>{suggestion.title}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Timestamp */}
        <div className={`text-xs text-white/40 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  )
}
