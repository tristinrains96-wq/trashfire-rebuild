'use client'

import { useScriptLabStore } from '@/store/scriptLab'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import chatBus from '@/lib/chat-bus'

export interface Suggestion {
  id: string
  title: string
  description?: string
  type: 'character' | 'location' | 'action' | 'dialogue'
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  onAction?: () => void
}

export interface AIMessage {
  id: string
  text: string
  timestamp: number
  type: 'response' | 'detection' | 'prompt'
  suggestions?: Suggestion[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  timestamp: number
  suggestions?: Suggestion[]
}

export function useScriptAI() {
  const router = useRouter()
  const {
    chat,
    plan,
    planStatus,
    draft,
    pushUser,
    pushAssistant,
    setDraft,
    generatePlanFromDraft,
    approvePlan,
    recomputeNeeds,
    setAssetLink,
    markScenesBuilt
  } = useScriptLabStore()

  const [isProcessing, setIsProcessing] = useState(false)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  // Mock AI response generator
  const generateAIResponse = useCallback((userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('anime') || lowerMessage.includes('character')) {
      return "I love the anime concept! Let me analyze your script and see what characters and locations we'll need."
    }
    
    if (lowerMessage.includes('script') || lowerMessage.includes('story')) {
      return "Great! I'm analyzing your script structure and will identify what assets we need to create."
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what')) {
      return "I'm your AI Co-Writer! I'll help you plan your episode, detect characters and locations, and prepare everything you need. Just tell me about your story idea!"
    }
    
    return "That's interesting! Let me analyze what you've shared and see how I can help bring your story to life."
  }, [])

  // Mock structure detection
  const detectStructure = useCallback((text: string) => {
    const characters = new Set<string>()
    const locations = new Set<string>()
    
    // Simple character detection (names in caps)
    const characterMatches = text.match(/[A-Z][A-Z\s]+:/g)
    if (characterMatches) {
      characterMatches.forEach(match => {
        const name = match.replace(':', '').trim()
        if (name.length > 1 && name.length < 20) {
          characters.add(name)
        }
      })
    }
    
    // Simple location detection
    const locationMatches = text.match(/(INT\.|EXT\.)\s+([A-Z\s]+)/g)
    if (locationMatches) {
      locationMatches.forEach(match => {
        const parts = match.split(/\s+/)
        if (parts.length > 1) {
          const location = parts.slice(1).join(' ').trim()
          if (location.length > 1) {
            locations.add(location)
          }
        }
      })
    }
    
    return {
      characters: Array.from(characters),
      locations: Array.from(locations)
    }
  }, [])

  // Send user message and get AI response
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isProcessing) return

    setIsProcessing(true)
    
    // Add user message
    pushUser(text)
    
    // Update draft if it contains script content
    if (text.length > 50 && (text.includes('INT.') || text.includes('EXT.') || text.includes('FADE'))) {
      setDraft(text)
    }
    
    // Generate AI response
    const aiResponse = generateAIResponse(text)
    pushAssistant(aiResponse)
    
    // Detect structure if we have substantial content
    if (text.length > 100) {
      const structure = detectStructure(text)
      
      if (structure.characters.length > 0 || structure.locations.length > 0) {
        // Generate plan from draft
        generatePlanFromDraft()
        
        // Create suggestions for detected entities
        const newSuggestions: Suggestion[] = []
        
        structure.characters.forEach((character, index) => {
          newSuggestions.push({
            id: `char_${Date.now()}_${index}`,
            title: `Found character: ${character}`,
            type: 'character',
            status: 'pending',
            onAction: () => console.log(`Generate character: ${character}`)
          })
        })
        
        structure.locations.forEach((location, index) => {
          newSuggestions.push({
            id: `loc_${Date.now()}_${index}`,
            title: `Found location: ${location}`,
            type: 'location',
            status: 'pending',
            onAction: () => console.log(`Generate location: ${location}`)
          })
        })
        
        setSuggestions(newSuggestions)
        
        // Show detection message
        const detectionMessage = `✨ I found ${structure.characters.length} character${structure.characters.length !== 1 ? 's' : ''} and ${structure.locations.length} location${structure.locations.length !== 1 ? 's' : ''}. I've added suggestions to help you design them.`
        
        // Add detection message
        setTimeout(() => {
          pushAssistant(detectionMessage)
        }, 1000)
      }
    }
    
    setIsProcessing(false)
  }, [isProcessing, pushUser, pushAssistant, generateAIResponse, detectStructure, setDraft, generatePlanFromDraft])

  // Continue the flow (for AI prompts)
  const continueFlow = useCallback(() => {
    if (planStatus === 'assets-ready') {
      const readyMessage = "All assets are ready! Shall we build your episode preview?"
      pushAssistant(readyMessage)
      
      const episodeSuggestions: Suggestion[] = [
        {
          id: 'build_episode',
          title: 'Build Episode Preview',
          type: 'action',
          status: 'pending',
          onAction: () => {
            markScenesBuilt()
            router.push('/workspace/episode')
          }
        }
      ]
      
      setSuggestions(episodeSuggestions)
    }
  }, [planStatus, pushAssistant, markScenesBuilt, router])

  // Check for ready state when plan status changes
  useEffect(() => {
    if (planStatus === 'assets-ready') {
      continueFlow()
    }
  }, [planStatus, continueFlow])

  // Subscribe to ChatBus for script messages
  useEffect(() => {
    const unsubscribe = chatBus.on('script:message', ({ text, files }) => {
      sendMessage(text)
    })

    return unsubscribe
  }, [sendMessage])

  // Convert chat messages to display format
  const messages: ChatMessage[] = chat.map(msg => ({
    id: msg.id,
    role: msg.role,
    text: msg.text,
    timestamp: msg.ts,
    suggestions: msg.role === 'assistant' && suggestions.length > 0 ? suggestions : undefined
  }))

  return {
    messages,
    isProcessing,
    sendMessage,
    continueFlow,
    suggestions
  }
}
