'use client'

import { ChatMessage } from '@/hooks/useScriptAI'
import { Button } from '@/components/ui/button'
import { Bot, User } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ChatThreadProps {
  messages: ChatMessage[]
  isProcessing?: boolean
}

export default function ChatThread({ messages, isProcessing = false }: ChatThreadProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isProcessing])

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto mb-4 text-teal-400" />
          <p className="text-lg mb-2">Script Lab — Your AI Co-Writer</p>
          <p className="text-sm">Chat naturally. I&apos;ll plan your episode and prepare assets for you.</p>
        </div>
      </div>
    )
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              message.role === 'user' 
                ? 'bg-gray-600' 
                : 'bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25'
            }`}>
              {message.role === 'user' ? (
                <User className="h-4 w-4 text-white" />
              ) : (
                <Bot className="h-4 w-4 text-white" />
              )}
            </div>
            
            {/* Message content */}
            <div className="flex flex-col gap-2">
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'bg-gradient-to-br from-teal-900/40 to-cyan-900/40 text-teal-100 border border-teal-500/20 shadow-lg shadow-teal-500/10'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                <p className="text-xs opacity-70 mt-2">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              
            </div>
          </div>
        </div>
      ))}
      
      {/* Processing indicator */}
      {isProcessing && (
        <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-gradient-to-br from-teal-900/40 to-cyan-900/40 text-teal-100 border border-teal-500/20 rounded-2xl px-4 py-3 shadow-lg shadow-teal-500/10">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-teal-200">Thinking...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
