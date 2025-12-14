'use client'

import { create } from 'zustand'
import { 
  ActivePanel, 
  StylePack, 
  StudioState, 
  Message, 
  IntentResult, 
  detectIntent, 
  applyIntent,
  getInitialState 
} from '@/flows/StudioFlowController'

interface StudioStore extends StudioState {
  messages: Message[]
  workspaceSessionId: string
  ui: {
    showSideRail: boolean
    showContextHUD: boolean
    showFloatingActions: boolean
  }
  tasks: Array<{
    id: string
    title: string
    description: string
    status: 'pending' | 'in-progress' | 'completed' | 'error'
    context: string
  }>
  setActive: (panel: ActivePanel) => void
  setStylePack: (stylePack: StylePack | undefined) => void
  pushMessage: (message: Message) => void
  pushAI: (text: string, options?: Message['options']) => void
  applyIntent: (intentResult: IntentResult) => void
  addTask: (task: Omit<StudioStore['tasks'][0], 'id'>) => void
  updateTask: (id: string, updates: Partial<StudioStore['tasks'][0]>) => void
  removeTask: (id: string) => void
  setUI: (updates: Partial<StudioStore['ui']>) => void
  reset: () => void
}

export const useStudioStore = create<StudioStore>((set, get) => ({
  ...getInitialState(),
  messages: [],
  workspaceSessionId: `session_${Date.now()}`,
  ui: {
    showSideRail: false,
    showContextHUD: true,
    showFloatingActions: true
  },
  tasks: [],
  
  setActive: (panel) => set({ activePanel: panel }),
  
  setStylePack: (stylePack) => set({ stylePack }),
  
  pushMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  pushAI: (text, options) => set((state) => ({
    messages: [...state.messages, {
      id: Date.now().toString(),
      role: 'ai',
      text,
      options
    }]
  })),
  
  applyIntent: (intentResult) => {
    const state = get()
    const newState = applyIntent(state, intentResult, (message) => {
      get().pushMessage(message)
    })
    set(newState)
  },

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: `task_${Date.now()}` }]
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),

  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id)
  })),

  setUI: (updates) => set((state) => ({
    ui: { ...state.ui, ...updates }
  })),
  
  reset: () => set({
    ...getInitialState(),
    messages: [],
    workspaceSessionId: `session_${Date.now()}`,
    ui: {
      showSideRail: false,
      showContextHUD: true,
      showFloatingActions: true
    },
    tasks: []
  })
}))
