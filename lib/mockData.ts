/**
 * Mock Data for Public UI Demo Branch
 * Provides example projects, episodes, scenes, characters, and assets
 * NO REAL DATA - FOR DEMO ONLY
 */

import type { 
  Character, 
  SceneBlock, 
  EpisodeScaffold,
  CharacterId,
  BackgroundId,
  EpisodeId 
} from '@/types'

// Mock Projects
export interface MockProject {
  id: string
  title: string
  thumbnail: string
  lastEdited: string
  type: 'episode' | 'character' | 'background' | 'voice' | 'scene' | 'music'
  status: 'active' | 'draft' | 'completed'
  episodeId?: EpisodeId
}

export const mockProjects: MockProject[] = [
  {
    id: 'proj_001',
    title: 'Epic Battle Scene',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-15T10:30:00Z',
    type: 'episode',
    status: 'active',
    episodeId: 'ep_001',
  },
  {
    id: 'proj_002',
    title: 'Character Design',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-14T15:20:00Z',
    type: 'character',
    status: 'active',
  },
  {
    id: 'proj_003',
    title: 'Background Set',
    thumbnail: '/trashfire-logo.png',
    lastEdited: '2024-01-12T09:15:00Z',
    type: 'background',
    status: 'draft',
  },
]

// Mock Characters
export const mockCharacters: Character[] = [
  {
    id: 'char_rin',
    name: 'Rin',
    description: 'A determined young warrior with fiery red hair and a strong sense of justice. Protagonist of the series.',
    voice: {
      id: 'voice_rin_001',
      name: 'Rin Voice',
      pitch: 65,
      speed: 75,
      emotion: 'determined',
    },
    assignedToEpisode: 'ep_001',
  },
  {
    id: 'char_daichi',
    name: 'Daichi',
    description: 'Rin\'s loyal friend and companion. Calm and analytical, often provides strategic advice.',
    voice: {
      id: 'voice_daichi_001',
      name: 'Daichi Voice',
      pitch: 55,
      speed: 70,
      emotion: 'calm',
    },
    assignedToEpisode: 'ep_001',
  },
  {
    id: 'char_principal',
    name: 'Vice Principal',
    description: 'Strict school administrator with a hidden compassionate side. Serves as a mentor figure.',
    voice: {
      id: 'voice_principal_001',
      name: 'Principal Voice',
      pitch: 45,
      speed: 60,
      emotion: 'authoritative',
    },
  },
]

// Mock Backgrounds
export const mockBackgrounds = [
  { id: 'bg_rooftop_night' as BackgroundId, name: 'Rooftop Night', thumb: '/placeholder.svg' },
  { id: 'bg_school_hallway' as BackgroundId, name: 'School Hallway', thumb: '/placeholder.svg' },
  { id: 'bg_shopping_district' as BackgroundId, name: 'Shopping District', thumb: '/placeholder.svg' },
  { id: 'bg_classroom' as BackgroundId, name: 'Classroom', thumb: '/placeholder.svg' },
  { id: 'bg_city_street' as BackgroundId, name: 'City Street', thumb: '/placeholder.svg' },
]

// Mock Props
export const mockProps = [
  { id: 'prop_sword', name: 'Mystic Sword', thumb: '/placeholder.svg' },
  { id: 'prop_book', name: 'Ancient Tome', thumb: '/placeholder.svg' },
  { id: 'prop_crystal', name: 'Power Crystal', thumb: '/placeholder.svg' },
]

// Mock Scenes for Episode 1
export const mockScenes: SceneBlock[] = [
  {
    id: 'scene_001',
    title: 'Scene 1 – Rooftop Confrontation',
    location: 'School Rooftop',
    timeOfDay: 'Evening',
    lines: [
      { character: 'RIN', text: 'I can\'t believe they\'re after us again.' },
      { character: 'DAICHI', text: 'We need to be careful. They\'re getting stronger.' },
      { text: 'The wind howls across the rooftop as Rin and Daichi prepare for battle.' },
    ],
    notes: 'High energy scene with dramatic lighting',
    assignedCharacters: ['char_rin', 'char_daichi'] as CharacterId[],
    assignedBackground: 'bg_rooftop_night' as BackgroundId,
    musicCue: 'epic_battle_theme',
  },
  {
    id: 'scene_002',
    title: 'Scene 2 – School Hallway',
    location: 'School Interior',
    timeOfDay: 'Afternoon',
    lines: [
      { character: 'VICE PRINCIPAL', text: 'Rin, Daichi, my office. Now.' },
      { text: 'The principal\'s voice echoes through the empty hallway.' },
      { character: 'RIN', text: 'What did we do this time?' },
    ],
    notes: 'Tension building scene',
    assignedCharacters: ['char_rin', 'char_daichi', 'char_principal'] as CharacterId[],
    assignedBackground: 'bg_school_hallway' as BackgroundId,
    musicCue: 'suspense_theme',
  },
  {
    id: 'scene_003',
    title: 'Scene 3 – Shopping District',
    location: 'City Shopping District',
    timeOfDay: 'Evening',
    lines: [
      { text: 'The city lights flicker as Rin walks through the bustling shopping district.' },
      { character: 'RIN', text: 'Something feels off tonight.' },
      { text: 'A shadow moves in the alleyway ahead.' },
    ],
    notes: 'Atmospheric scene with mystery elements',
    assignedCharacters: ['char_rin'] as CharacterId[],
    assignedBackground: 'bg_shopping_district' as BackgroundId,
    musicCue: 'mystery_theme',
  },
]

// Mock Episode Scaffold
export const mockEpisodeScaffold: EpisodeScaffold = {
  episodeId: 'ep_001' as EpisodeId,
  title: 'The Awakening',
  scenes: mockScenes,
  characters: ['char_rin', 'char_daichi', 'char_principal'] as CharacterId[],
  backgrounds: ['bg_rooftop_night', 'bg_school_hallway', 'bg_shopping_district'] as BackgroundId[],
  props: ['prop_sword', 'prop_crystal'],
}

// Mock Episode Data
export interface MockEpisode {
  id: EpisodeId
  project_id: string
  title: string
  outline_json?: any
  script_json?: any
  status: 'draft' | 'generating' | 'complete' | 'error'
  created_at: string
  updated_at?: string
}

export const mockEpisode: MockEpisode = {
  id: 'ep_001' as EpisodeId,
  project_id: 'proj_001',
  title: 'The Awakening',
  outline_json: {
    title: 'The Awakening',
    scenes: mockScenes.map(s => ({
      id: s.id,
      title: s.title,
      location: s.location,
    })),
  },
  script_json: {
    scenes: mockScenes,
  },
  status: 'complete',
  created_at: '2024-01-15T10:30:00Z',
  updated_at: '2024-01-15T12:00:00Z',
}

// Helper functions to get mock data
export function getMockProject(id: string): MockProject | undefined {
  return mockProjects.find(p => p.id === id)
}

export function getMockEpisode(id: EpisodeId): MockEpisode | undefined {
  if (id === 'ep_001') return mockEpisode
  return undefined
}

export function getMockCharacter(id: CharacterId): Character | undefined {
  return mockCharacters.find(c => c.id === id)
}

export function getMockScenes(episodeId: EpisodeId): SceneBlock[] {
  if (episodeId === 'ep_001') return mockScenes
  return []
}

export function getAllMockCharacters(): Character[] {
  return mockCharacters
}

export function getAllMockBackgrounds() {
  return mockBackgrounds
}

export function getAllMockProps() {
  return mockProps
}


