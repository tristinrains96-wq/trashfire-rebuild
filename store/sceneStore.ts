import { create } from 'zustand'

export interface Scene {
  id: string
  title: string
  location: string
  timeOfDay: 'Day' | 'Night' | 'Sunset'
  speakers: string[]
  estDurationSec: number
}

export interface Beat {
  sceneId: string
  t: number
  type: string
}

export interface SceneGraph {
  scenes: Scene[]
  detectedCharacters: string[]
  detectedLocations: string[]
  beats: Beat[]
}

export interface EntityMapping {
  characters: Record<string, string> // detectedName -> assetId or "auto"
  locations: Record<string, string>   // detectedLocation -> bgId or "auto"
}

interface SceneStore {
  sceneGraph: SceneGraph | null
  mapping: EntityMapping | null
  activeSceneId: string | null
  
  setGraph: (graph: SceneGraph) => void
  setMapping: (mapping: EntityMapping) => void
  setActiveScene: (sceneId: string) => void
  clearGraph: () => void
  clearMapping: () => void
}

export const useSceneStore = create<SceneStore>((set) => ({
  sceneGraph: null,
  mapping: null,
  activeSceneId: null,
  
  setGraph: (graph) => set({ sceneGraph: graph }),
  setMapping: (mapping) => set({ mapping }),
  setActiveScene: (sceneId) => set({ activeSceneId: sceneId }),
  clearGraph: () => set({ sceneGraph: null, mapping: null, activeSceneId: null }),
  clearMapping: () => set({ mapping: null }),
}))
