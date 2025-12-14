'use client'

import { motion } from 'framer-motion'
import ChatMessage from './ChatMessage'
import { useScriptAI } from '@/hooks/useScriptAI'

interface ChatStreamProps {
  className?: string
}

export default function ChatStream({ className = "" }: ChatStreamProps) {
  const { messages, isProcessing } = useScriptAI()

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
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
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💬</span>
              </div>
            </motion.div>
            <h3 className="text-lg font-medium text-white mb-2">Start a conversation</h3>
            <p className="text-white/60 text-sm max-w-md">
              Tell me about your story idea, and I&apos;ll help you bring it to life.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                text={message.text}
                timestamp={message.timestamp}
                suggestions={message.suggestions?.filter(s => s.onAction).map(s => ({
                  id: s.id,
                  title: s.title,
                  onAction: s.onAction!
                }))}
              />
            ))}
            
            {/* Processing indicator */}
            {isProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 mb-6"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Thinking...</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
