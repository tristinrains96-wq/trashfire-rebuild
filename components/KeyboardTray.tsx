'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Drawer from '@/components/ui/drawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Mic, Send, Upload, Music, Image } from 'lucide-react'
import chatBus from '@/lib/chat-bus'

interface KeyboardTrayProps {
  onAssist?: (action: any) => void
}

export default function KeyboardTray({ onAssist }: KeyboardTrayProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const pathname = usePathname()
  
  // Get context-aware placeholder and routing
  const getContextInfo = () => {
    if (pathname === '/workspace' || pathname.startsWith('/workspace?')) {
      // Use search params to determine context
      const urlParams = new URLSearchParams(window.location.search)
      const section = urlParams.get('section') || 'script'
      
      switch (section) {
        case 'script':
          return {
            placeholder: "Tell me about your story idea…",
            context: "Script Lab"
          }
        case 'characters':
          return {
            placeholder: "Describe or upload a reference for your character…",
            context: "Characters"
          }
        case 'backgrounds':
          return {
            placeholder: "Describe the environment…",
            context: "Backgrounds"
          }
        case 'voices':
          return {
            placeholder: "Type a sample line to preview a voice…",
            context: "Voices"
          }
        case 'scenes':
          return {
            placeholder: "Describe the next beat or camera move…",
            context: "Scenes"
          }
        case 'episode':
          return {
            placeholder: "Type notes for the final export…",
            context: "Episode"
          }
        default:
          return {
            placeholder: "Ask anything…",
            context: "Workspace"
          }
      }
    } else {
      return {
        placeholder: "Ask anything…",
        context: "Workspace"
      }
    }
  }

  const { placeholder, context } = getContextInfo()

  // Handle send - route based on pathname
  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return
    
    const text = inputValue.trim()
    setInputValue('')
    
    // Use the new global command system
    chatBus.emit('command:submit', { text })
    
    // Legacy routing for backward compatibility
    if (pathname === '/workspace' || pathname.startsWith('/workspace?')) {
      const urlParams = new URLSearchParams(window.location.search)
      const section = urlParams.get('section') || 'script'
      
      if (section === 'script') {
        chatBus.emit('script:message', { text })
      } else if (section === 'characters') {
        chatBus.emit('characters:message', { text })
      } else {
        // Default behavior for other sections
        if (onAssist) {
          onAssist({ action: 'process_input', text })
        }
      }
    } else {
      // Default behavior for other sections
      if (onAssist) {
        onAssist({ action: 'process_input', text })
      }
    }
  }

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Keyboard offset detection
  useEffect(() => {
    const updateKeyboardOffset = () => {
      if (isFocused) {
        // Basic heuristic: if input is focused and we're on mobile, assume keyboard is open
        const isMobile = window.innerWidth < 768
        const keyboardHeight = isMobile ? 300 : 0 // Fallback height for mobile
        document.body.style.setProperty('--kb-offset', `${keyboardHeight}px`)
      } else {
        document.body.style.setProperty('--kb-offset', '0px')
      }
    }

    updateKeyboardOffset()
    
    // Cleanup on unmount
    return () => {
      document.body.style.setProperty('--kb-offset', '0px')
    }
  }, [isFocused])

  return (
    <>
      {/* Main Input Tray */}
      <div className="w-full" style={{ position: 'sticky', zIndex: 50 }}>
        <div className="flex h-16 items-center gap-3">
          {/* Upload Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setDrawerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Upload</span>
          </Button>

          {/* Context indicator chip */}
          {context !== 'Workspace' && (
            <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-600/10 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
              {context}
            </div>
          )}

          {/* Input */}
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="rounded-full"
            />
          </div>

          {/* Mic Button */}
          <Button variant="outline" size="icon" className="h-10 w-10 shrink-0">
            <Mic className="h-4 w-4" />
            <span className="sr-only">Voice input</span>
          </Button>

          {/* Send Button */}
          <Button 
            size="icon" 
            className="h-10 w-10 shrink-0"
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>

      {/* Upload Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Assets</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-surface border-dashed border-2 border-border hover:border-accent transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Image className="h-8 w-8 text-text-secondary mb-2" />
                <span className="text-sm text-text-secondary">Images</span>
              </CardContent>
            </Card>
            <Card className="bg-surface border-dashed border-2 border-border hover:border-accent transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Music className="h-8 w-8 text-text-secondary mb-2" />
                <span className="text-sm text-text-secondary">Audio</span>
              </CardContent>
            </Card>
            <Card className="bg-surface border-dashed border-2 border-border hover:border-accent transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Upload className="h-8 w-8 text-text-secondary mb-2" />
                <span className="text-sm text-text-secondary">Video</span>
              </CardContent>
            </Card>
            <Card className="bg-surface border-dashed border-2 border-border hover:border-accent transition-colors cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Upload className="h-8 w-8 text-text-secondary mb-2" />
                <span className="text-sm text-text-secondary">Documents</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </Drawer>
    </>
  )
}
