export type SlotCategory = 'characters' | 'locations' | 'props' | 'scenes' | 'voices' | 'episode'

export type SlotStatus = 'empty' | 'draft' | 'locked'

export interface StyleLocks {
  palette: boolean
  line: boolean
  outfit: boolean
  face: boolean
}

export interface SlotUsage {
  previewRerolls: number
}

export interface SlotItem {
  id: string
  title: string
  status: SlotStatus
  prompt?: string
  negativePrompt?: string
  seed?: number
  previewUrl?: string
  locks?: StyleLocks
  voiceId?: string
  usage?: SlotUsage
  lastGeneratedAt?: string
}

export interface SceneComposition {
  characterIds: string[]
  locationId?: string
  propIds: string[]
  placements?: Record<string, {
    scale?: number
    x?: number
    y?: number
    rotation?: number
  }>
}

export type SelectedTarget =
  | { kind: 'slot'; categoryId: SlotCategory; slotId: string }
  | { kind: 'scene'; sceneId: string; assetRef: { categoryId: SlotCategory; slotId: string } }
  | null

export interface ProjectLabState {
  categories: Record<SlotCategory, SlotItem[]>
  scriptText: string
  scenePlanText: string
  previewReady: boolean
  sceneCompositions: Record<string, SceneComposition>
}

