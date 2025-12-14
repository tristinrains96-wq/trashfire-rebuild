'use client'

// Lightweight event bus for chat communication
type Events = {
  'command:submit': { text: string; files?: File[] }
  'flow:intent': { intent: string; payload?: any }
  // Legacy events for backward compatibility
  'script:message': { text: string; files?: File[] }
  'characters:message': { text: string; files?: File[] }
  // Quick actions per section
  'script:quick': { action: 'beat_sheet' | 'auto_map_entities' }
  'characters:quick': { action: 'generate_master_sheet' | 'lock_consistency' }
  'backgrounds:quick': { action: 'generate_environment_set' }
  'episode:quick': { action: 'add_storyboard_row' | 'compile_preview' }
}

class ChatBus {
  private listeners: Map<keyof Events, Set<(data: any) => void>> = new Map()

  on<K extends keyof Events>(event: K, callback: (data: Events[K]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback)
    }
  }

  emit<K extends keyof Events>(event: K, data: Events[K]) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data))
    }
  }

  off<K extends keyof Events>(event: K, callback: (data: Events[K]) => void) {
    this.listeners.get(event)?.delete(callback)
  }
}

const chatBus = new ChatBus()
export default chatBus
