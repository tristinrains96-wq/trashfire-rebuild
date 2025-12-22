export type SlotCategory = 'characters' | 'locations' | 'props' | 'scenes' | 'voices' | 'episode'

export type SlotStatus = 'empty' | 'draft' | 'locked'

export interface SlotItem {
  id: string
  title: string
  status: SlotStatus
  prompt?: string
  previewUrl?: string
}

export interface SceneComposition {
  characterIds: string[]
  locationId?: string
  propIds: string[]
}

export interface ProjectLabState {
  categories: Record<SlotCategory, SlotItem[]>
  scriptText: string
  scenePlanText: string
  previewReady: boolean
  sceneCompositions: Record<string, SceneComposition>
}

