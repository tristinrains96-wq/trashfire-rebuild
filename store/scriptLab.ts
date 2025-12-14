'use client'

import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  ts: number
}

export interface Scene {
  id: string
  title: string
  estSec: number
}

export interface Sequence {
  title: string
  scenes: Scene[]
}

export interface Act {
  title: string
  sequences: Sequence[]
}

export interface OutlineModel {
  acts: Act[]
}

export interface BeatModel {
  id: string
  label: string
  tSec: number
  note?: string
}

export interface SceneCardModel {
  id: string
  title: string
  location: string
  timeOfDay: 'Day' | 'Night' | 'Sunset'
  speakers: string[]
  estSec: number
}

export type ScriptLabView = 'chat' | 'outline' | 'beats' | 'scenes' | 'draft'

export type PlanStatus = 'idle' | 'draft-plan' | 'approved' | 'assets-needed' | 'assets-ready' | 'scenes-ready'

export interface PlanCharacter {
  name: string
  characterId?: string
  voiceId?: string
  status: 'ready' | 'needs-design' | 'needs-voice'
}

export interface PlanLocation {
  name: string
  backgroundId?: string
  status: 'ready' | 'needs-bg'
}

export interface PlanScene {
  number: number
  slug: string
  oneLiner: string
  status?: 'todo' | 'done'
}

export interface Plan {
  characters: PlanCharacter[]
  locations: PlanLocation[]
  scenes: PlanScene[]
}

export interface Alert {
  id: string
  level: 'info' | 'warn' | 'block'
  msg: string
  action?: {
    label: string
    prompt: string
  }
}

export interface NextAction {
  label: string
  prompt: string
}

export interface ScriptLabState {
  // UI State
  activeView: ScriptLabView
  showAdvanced: boolean
  
  // Chat
  chat: ChatMessage[]
  
  // Data Models
  outline: OutlineModel | null
  beats: BeatModel[]
  sceneCards: SceneCardModel[]
  
  // Plan System
  planStatus: PlanStatus
  plan: Plan
  
  // Assistant feedback
  alerts: Alert[]
  nextActions: NextAction[]
  
  // Draft and Canonical Script
  draft: string | null
  canonicalScript: string | null
  
  // Actions
  pushUser: (text: string) => void
  pushAssistant: (text: string) => void
  setActiveView: (view: ScriptLabView) => void
  setShowAdvanced: (show: boolean) => void
  setFromMockResult: (result: {
    outline?: OutlineModel
    beats?: BeatModel[]
    sceneCards?: SceneCardModel[]
    canonicalText?: string
    draft?: string
    alerts?: Alert[]
    nextActions?: NextAction[]
  }) => void
  setAlerts: (alerts: Alert[]) => void
  setNextActions: (actions: NextAction[]) => void
  setDraft: (draft: string | null) => void
  promoteToScript: (text: string) => void
  clear: () => void
  
  // Plan Actions
  generatePlanFromDraft: () => void
  approvePlan: () => void
  recomputeNeeds: () => void
  setAssetLink: (type: 'character' | 'location', name: string, assetId: string) => void
  markScenesBuilt: () => void
}

const initialState = {
  activeView: 'chat' as ScriptLabView,
  showAdvanced: false,
  chat: [],
  outline: null,
  beats: [],
  sceneCards: [],
  planStatus: 'idle' as PlanStatus,
  plan: {
    characters: [],
    locations: [],
    scenes: []
  },
  alerts: [],
  nextActions: [],
  draft: `FADE IN:

EXT. CITY STREET - DAY

SARAH, a determined young woman in her 20s, walks briskly down the busy street. She clutches a mysterious package.

SARAH
I can't be late. Not this time.

INT. COFFEE SHOP - DAY

Sarah enters the cozy coffee shop. The barista, MIKE, looks up from behind the counter.

MIKE
Hey Sarah! The usual?

SARAH
Actually, I need something stronger today.

Mike nods knowingly and starts preparing her drink.

FADE OUT.`,
  canonicalScript: null,
}

export const useScriptLabStore = create<ScriptLabState>((set, get) => ({
  ...initialState,
  
  pushUser: (text: string) => {
    const message: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      ts: Date.now()
    }
    set(state => ({
      chat: [...state.chat, message]
    }))
  },
  
  pushAssistant: (text: string) => {
    const message: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text,
      ts: Date.now()
    }
    set(state => ({
      chat: [...state.chat, message]
    }))
  },
  
  setActiveView: (view: ScriptLabView) => {
    set({ activeView: view })
  },
  
  setShowAdvanced: (show: boolean) => {
    set({ showAdvanced: show })
  },
  
  setFromMockResult: (result) => {
    set(state => ({
      outline: result.outline || state.outline,
      beats: result.beats || state.beats,
      sceneCards: result.sceneCards || state.sceneCards,
      canonicalScript: result.canonicalText || state.canonicalScript,
      draft: result.draft || state.draft,
      alerts: result.alerts || state.alerts,
      nextActions: result.nextActions || state.nextActions
    }))
  },
  
  setAlerts: (alerts: Alert[]) => {
    set({ alerts })
  },
  
  setNextActions: (actions: NextAction[]) => {
    set({ nextActions: actions })
  },
  
  setDraft: (draft: string | null) => {
    set({ draft })
  },
  
  promoteToScript: (text: string) => {
    set({ canonicalScript: text })
  },
  
  clear: () => {
    set(initialState)
  },
  
  // Plan Actions
  generatePlanFromDraft: () => {
    const { draft } = get()
    if (!draft) return
    
    // Mock parser - extract characters, locations, and scenes from draft
    const characters = extractCharactersFromDraft(draft)
    const locations = extractLocationsFromDraft(draft)
    const scenes = extractScenesFromDraft(draft)
    
    set({
      planStatus: 'draft-plan',
      plan: {
        characters,
        locations,
        scenes
      }
    })
  },
  
  approvePlan: () => {
    set({ planStatus: 'approved' })
    get().recomputeNeeds()
  },
  
  recomputeNeeds: () => {
    const { plan } = get()
    
    // Mock asset checking - in real implementation, check against actual assets
    const updatedPlan = {
      ...plan,
      characters: plan.characters.map(char => ({
        ...char,
        status: char.characterId ? 'ready' as const : 'needs-design' as const
      })),
      locations: plan.locations.map(loc => ({
        ...loc,
        status: loc.backgroundId ? 'ready' as const : 'needs-bg' as const
      }))
    }
    
    const hasNeeds = updatedPlan.characters.some(c => c.status !== 'ready') || 
                   updatedPlan.locations.some(l => l.status !== 'ready')
    
    set({
      plan: updatedPlan,
      planStatus: hasNeeds ? 'assets-needed' : 'assets-ready'
    })
  },
  
  setAssetLink: (type: 'character' | 'location', name: string, assetId: string) => {
    const { plan } = get()
    
    if (type === 'character') {
      const updatedPlan = {
        ...plan,
        characters: plan.characters.map(char => 
          char.name === name ? { ...char, characterId: assetId } : char
        )
      }
      set({ plan: updatedPlan })
    } else {
      const updatedPlan = {
        ...plan,
        locations: plan.locations.map(loc => 
          loc.name === name ? { ...loc, backgroundId: assetId } : loc
        )
      }
      set({ plan: updatedPlan })
    }
    
    // Recompute needs after linking
    get().recomputeNeeds()
  },
  
  markScenesBuilt: () => {
    set({ planStatus: 'scenes-ready' })
  }
}))

// Mock helper functions for parsing draft
function extractCharactersFromDraft(draft: string): PlanCharacter[] {
  // Simple mock extraction - in real implementation, use NLP
  const characterNames = new Set<string>()
  const lines = draft.split('\n')
  
  lines.forEach(line => {
    const match = line.match(/^([A-Z][A-Z\s]+):/)
    if (match) {
      characterNames.add(match[1].trim())
    }
  })
  
  return Array.from(characterNames).map(name => ({
    name,
    status: 'needs-design' as const
  }))
}

function extractLocationsFromDraft(draft: string): PlanLocation[] {
  // Simple mock extraction - in real implementation, use NLP
  const locationNames = new Set<string>()
  const lines = draft.split('\n')
  
  lines.forEach(line => {
    if (line.includes('INT.') || line.includes('EXT.')) {
      const match = line.match(/(INT\.|EXT\.)\s+([A-Z\s]+)/)
      if (match) {
        locationNames.add(match[2].trim())
      }
    }
  })
  
  return Array.from(locationNames).map(name => ({
    name,
    status: 'needs-bg' as const
  }))
}

function extractScenesFromDraft(draft: string): PlanScene[] {
  // Simple mock extraction - in real implementation, use NLP
  const scenes: PlanScene[] = []
  const lines = draft.split('\n')
  let sceneNumber = 1
  
  lines.forEach((line, index) => {
    if (line.includes('INT.') || line.includes('EXT.')) {
      const nextLine = lines[index + 1]
      const oneLiner = nextLine ? nextLine.trim().substring(0, 50) + '...' : 'Scene description'
      
      scenes.push({
        number: sceneNumber++,
        slug: `scene-${sceneNumber}`,
        oneLiner,
        status: 'todo' as const
      })
    }
  })
  
  return scenes
}
