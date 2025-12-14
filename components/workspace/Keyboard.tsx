'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Drawer from '@/components/ui/drawer'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Plus, 
  Mic, 
  Send, 
  Upload, 
  FileText, 
  Image, 
  Music, 
  Film, 
  Users, 
  MoreVertical,
  Wand2,
  Eye,
  Download,
  Play,
  Settings,
  Zap
} from 'lucide-react'
import { useWorkspace } from '@/store/workspace'
import chatBus from '@/lib/chat-bus'

interface KeyboardProps {
  onAssist?: (action: any) => void
}

// Context-specific configuration
const contextConfig = {
  script: {
    placeholder: "Tell me about your story idea…",
    context: "Script Lab",
    primaryAction: "Analyze & Map",
    primaryIcon: FileText,
    dockItems: [
      { label: "Story Doc", icon: FileText, types: [".txt", ".md", ".pdf"] },
      { label: "Reference", icon: Image, types: [".jpg", ".png", ".gif"] }
    ],
    secondaryActions: [
      { label: "Detect Entities", icon: Zap, action: () => console.log('Detect Entities') },
      { label: "Refine Outline", icon: Wand2, action: () => console.log('Refine Outline') }
    ]
  },
  characters: {
    placeholder: "Describe or upload a reference for your character…",
    context: "Character Studio",
    primaryAction: "Generate Turntable",
    primaryIcon: Users,
    dockItems: [
      { label: "Reference Image", icon: Image, types: [".jpg", ".png", ".gif"] },
      { label: "Pose JSON", icon: FileText, types: [".json"] },
      { label: "Style Sheet", icon: FileText, types: [".txt", ".md"] }
    ],
    secondaryActions: [
      { label: "Lock Consistency", icon: Settings, action: () => console.log('Lock Consistency') },
      { label: "Auto-Generate", icon: Wand2, action: () => console.log('Auto-Generate') }
    ]
  },
  backgrounds: {
    placeholder: "Describe the environment or upload a reference…",
    context: "Background Design",
    primaryAction: "Generate Set",
    primaryIcon: Image,
    dockItems: [
      { label: "Plate/HDRI", icon: Image, types: [".hdr", ".exr", ".jpg", ".png"] },
      { label: "Depth Map", icon: Image, types: [".png", ".jpg"] },
      { label: "Reference", icon: Image, types: [".jpg", ".png", ".gif"] }
    ],
    secondaryActions: [
      { label: "Import Reference", icon: Upload, action: () => console.log('Import Reference') },
      { label: "Style Transfer", icon: Wand2, action: () => console.log('Style Transfer') }
    ]
  },
  voices: {
    placeholder: "Describe voice characteristics or upload audio samples…",
    context: "Voice Studio",
    primaryAction: "Generate Voice",
    primaryIcon: Mic,
    dockItems: [
      { label: "Audio Sample", icon: Music, types: [".mp3", ".wav", ".m4a"] },
      { label: "Voice Profile", icon: FileText, types: [".json", ".txt"] }
    ],
    secondaryActions: [
      { label: "Test Voice", icon: Play, action: () => console.log('Test Voice') },
      { label: "Auto-Tune", icon: Settings, action: () => console.log('Auto-Tune') }
    ]
  },
  scenes: {
    placeholder: "Describe the scene or upload references…",
    context: "Scene Studio",
    primaryAction: "Generate Scene",
    primaryIcon: Film,
    dockItems: [
      { label: "Reference", icon: Image, types: [".jpg", ".png", ".gif"] },
      { label: "Storyboard", icon: FileText, types: [".txt", ".md"] },
      { label: "Audio Cue", icon: Music, types: [".mp3", ".wav", ".m4a"] }
    ],
    secondaryActions: [
      { label: "Preview Scene", icon: Eye, action: () => console.log('Preview Scene') },
      { label: "Export Scene", icon: Download, action: () => console.log('Export Scene') }
    ]
  },
  episode: {
    placeholder: "Add notes for scene generation or episode export…",
    context: "Episode Studio",
    primaryAction: "Generate Scene",
    primaryIcon: Play,
    dockItems: [
      { label: "Scene Notes", icon: FileText, types: [".txt", ".md"] },
      { label: "Reference", icon: Image, types: [".jpg", ".png", ".gif"] },
      { label: "Audio Cue", icon: Music, types: [".mp3", ".wav", ".m4a"] }
    ],
    secondaryActions: [
      { label: "Preview Episode", icon: Eye, action: () => console.log('Preview Episode') },
      { label: "Export Episode", icon: Download, action: () => console.log('Export Episode') }
    ]
  }
}

export default function Keyboard({ onAssist }: KeyboardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSecondaryActions, setShowSecondaryActions] = useState(false)
  const kebabRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { activeSection, status, taskProgress, setStatus, setTaskProgress } = useWorkspace()
  const config = contextConfig[activeSection] || contextConfig.script

  // Handle send
  const handleSend = async () => {
    if (!inputValue.trim() || isProcessing) return
    
    const text = inputValue.trim()
    setInputValue('')
    setIsProcessing(true)
    setStatus('busy')
    setTaskProgress(0)
    
    // Simulate progress
    let progressValue = 0
    setTaskProgress(progressValue)
    const progressInterval = setInterval(() => {
      progressValue = Math.min(100, progressValue + 10)
      setTaskProgress(progressValue)
      if (progressValue >= 100) {
        clearInterval(progressInterval)
        setIsProcessing(false)
        setStatus('ready')
        setTaskProgress(null)
      }
    }, 200)
    
    // Use the new global command system
    chatBus.emit('command:submit', { text })
    
    // Section-specific routing
    chatBus.emit(`${activeSection}:message` as any, { text })
    
    // Legacy routing for backward compatibility
    if (onAssist) {
      onAssist({ action: 'process_input', text })
    }
  }

  // Handle primary action
  const handlePrimaryAction = () => {
    setStatus('busy')
    setTaskProgress(0)
    
    // Simulate progress
    let progressValue = 0
    setTaskProgress(progressValue)
    const progressInterval = setInterval(() => {
      progressValue = Math.min(100, progressValue + 15)
      setTaskProgress(progressValue)
      if (progressValue >= 100) {
        clearInterval(progressInterval)
        setStatus('ready')
        setTaskProgress(null)
      }
    }, 150)
    
    // Emit section-specific action
    chatBus.emit(`${activeSection}:primary_action` as any, { action: config.primaryAction })
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
        const isMobile = window.innerWidth < 768
        const keyboardHeight = isMobile ? 300 : 0
        document.body.style.setProperty('--kb-offset', `${keyboardHeight}px`)
      } else {
        document.body.style.setProperty('--kb-offset', '0px')
      }
    }

    updateKeyboardOffset()
    
    return () => {
      document.body.style.setProperty('--kb-offset', '0px')
    }
  }, [isFocused])

  const PrimaryIcon = config.primaryIcon

  // Close kebab menu on outside click and Esc
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!kebabRef.current) return
      if (showSecondaryActions && !kebabRef.current.contains(e.target as Node)) {
        setShowSecondaryActions(false)
      }
    }
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSecondaryActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [showSecondaryActions])

  return (
    <>
      {/* Main Input Tray */}
      <div className="w-full">
        <div className="flex h-16 items-center gap-3">
          {/* Context Attachment Dock */}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setDrawerOpen(true)}
            aria-expanded={drawerOpen}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Upload</span>
          </Button>

          {/* Context indicator chip */}
          <div className="flex items-center gap-2 text-xs text-teal-400 bg-teal-600/10 px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-teal-400 rounded-full"></span>
            {config.context}
          </div>

          {/* Input */}
          <div className="flex-1">
            <Input
              ref={inputRef}
              placeholder={config.placeholder}
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

          {/* Primary FAB */}
          <Button 
            size="icon" 
            className="h-10 w-10 shrink-0 relative overflow-hidden"
            onClick={handlePrimaryAction}
            disabled={isProcessing}
          >
            {isProcessing && taskProgress !== null ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white/20 rounded-full">
                  <motion.div
                    className="w-full h-full border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </div>
                <span className="absolute text-xs font-medium">
                  {taskProgress}%
                </span>
              </div>
            ) : (
              <PrimaryIcon className="h-4 w-4" />
            )}
            <span className="sr-only">{config.primaryAction}</span>
          </Button>

          {/* Secondary Actions Menu */}
          <div className="relative" ref={kebabRef}>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0"
              onClick={() => setShowSecondaryActions(!showSecondaryActions)}
            >
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More actions</span>
            </Button>

            {/* Secondary Actions Dropdown */}
            <AnimatePresence>
              {showSecondaryActions && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-900/95 backdrop-blur-md rounded-xl border border-white/10 shadow-xl z-50"
                >
                  <div className="p-2">
                    {config.secondaryActions.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <button
                          key={action.label}
                          onClick={() => {
                            action.action()
                            setShowSecondaryActions(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white/90 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{action.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Context Attachment Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Upload for {config.context}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {config.dockItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Card 
                  key={item.label}
                  className="bg-surface border-dashed border-2 border-border hover:border-accent transition-colors cursor-pointer"
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <Icon className="h-6 w-6 text-text-secondary" />
                    <div>
                      <span className="text-sm font-medium text-text-primary">{item.label}</span>
                      <p className="text-xs text-text-secondary">
                        {item.types.join(', ')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {/* Quick actions per section */}
          <div className="mt-5 space-y-2">
            {activeSection === 'script' && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => chatBus.emit('script:quick', { action: 'beat_sheet' })}>Make beat sheet</Button>
                <Button variant="secondary" onClick={() => chatBus.emit('script:quick', { action: 'auto_map_entities' })}>Auto-map entities</Button>
              </div>
            )}
            {activeSection === 'characters' && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => chatBus.emit('characters:quick', { action: 'generate_master_sheet' })}>Generate master sheet</Button>
                <Button variant="secondary" onClick={() => chatBus.emit('characters:quick', { action: 'lock_consistency' })}>Lock consistency</Button>
              </div>
            )}
            {activeSection === 'backgrounds' && (
              <div className="grid grid-cols-1 gap-2">
                <Button variant="secondary" onClick={() => chatBus.emit('backgrounds:quick', { action: 'generate_environment_set' })}>Generate environment set</Button>
              </div>
            )}
            {activeSection === 'episode' && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => chatBus.emit('episode:quick', { action: 'add_storyboard_row' })}>Add storyboard row</Button>
                <Button variant="secondary" onClick={() => chatBus.emit('episode:quick', { action: 'compile_preview' })}>Compile preview</Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </>
  )
}
