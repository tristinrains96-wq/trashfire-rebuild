'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send, Mic, MicOff } from 'lucide-react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isProcessing?: boolean
  placeholder?: string
}

export default function ChatInput({ 
  onSendMessage, 
  isProcessing = false,
  placeholder = "Tell me about your story idea..."
}: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !isProcessing) {
      onSendMessage(message.trim())
      setMessage('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    // In a real implementation, this would start/stop voice recording
  }

  return (
    <div className="border-t border-teal-500/20 bg-background/95 backdrop-blur">
      <div className="p-4">
        <div className="flex items-end gap-3">
          {/* Text input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isProcessing}
              className="min-h-[44px] max-h-[120px] resize-none bg-gray-900/50 border-teal-500/30 text-white placeholder-gray-400 focus:border-teal-400 focus:ring-teal-400/20 pr-12"
              rows={1}
            />
            
            {/* Recording button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleRecording}
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 ${
                isRecording 
                  ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                  : 'text-gray-400 hover:text-teal-300 hover:bg-teal-900/20'
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isProcessing}
            className="bg-teal-600 hover:bg-teal-700 text-white disabled:bg-gray-700 disabled:text-gray-400 h-11 px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="mt-2 flex items-center gap-2 text-red-400 text-sm">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            Recording... Click to stop
          </div>
        )}
      </div>
    </div>
  )
}
