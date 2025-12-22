import { ProjectLabState, SlotItem } from './projectLabTypes'

export function createDefaultProjectLabState(): ProjectLabState {
  return {
    categories: {
      characters: [
        { id: 'char-1', title: 'Hero', status: 'empty' },
        { id: 'char-2', title: 'Rival', status: 'empty' },
      ],
      locations: [
        { id: 'loc-1', title: 'Town', status: 'empty' },
        { id: 'loc-2', title: 'Hideout', status: 'empty' },
      ],
      props: [
        { id: 'prop-1', title: 'Weapon', status: 'empty' },
        { id: 'prop-2', title: 'Key Item', status: 'empty' },
      ],
      scenes: [
        { id: 'scene-1', title: 'Scene 1', status: 'empty' },
        { id: 'scene-2', title: 'Scene 2', status: 'empty' },
        { id: 'scene-3', title: 'Scene 3', status: 'empty' },
        { id: 'scene-4', title: 'Scene 4', status: 'empty' },
      ],
      voices: [
        { id: 'voice-1', title: 'Hero Voice', status: 'empty' },
        { id: 'voice-2', title: 'Rival Voice', status: 'empty' },
      ],
      episode: [
        { id: 'episode-1', title: 'Episode Overview', status: 'empty' },
      ],
    },
    scriptText: '',
    scenePlanText: '',
    previewReady: false,
    sceneCompositions: {},
  }
}

export function generateMockScenePlan(): string {
  return `# Scene Plan

## Scene 1: Opening
- **Setting**: Town square at dawn
- **Characters**: Hero
- **Action**: Hero discovers a mysterious artifact
- **Duration**: 30 seconds

## Scene 2: Conflict
- **Setting**: Hideout
- **Characters**: Hero, Rival
- **Action**: Confrontation over the artifact
- **Duration**: 45 seconds

## Scene 3: Resolution
- **Setting**: Town
- **Characters**: Hero
- **Action**: Hero makes a crucial decision
- **Duration**: 30 seconds

## Scene 4: Climax
- **Setting**: Hideout
- **Characters**: Hero, Rival
- **Action**: Final confrontation
- **Duration**: 60 seconds
`
}

export function generateMockPrompts(category: string, slotTitle: string): string {
  const prompts: Record<string, Record<string, string>> = {
    characters: {
      Hero: 'A young anime protagonist with spiky hair, determined eyes, wearing a school uniform. Bright and energetic personality.',
      Rival: 'A cool, mysterious rival character with dark hair and piercing eyes. Wears a dark jacket and has a confident stance.',
    },
    locations: {
      Town: 'A peaceful anime town with traditional Japanese architecture, cherry blossoms, and warm lighting. Morning atmosphere.',
      Hideout: 'A dark, mysterious hideout with dim lighting, shadows, and a sense of danger. Underground or abandoned building.',
    },
    props: {
      Weapon: 'A glowing magical sword with intricate designs, emitting a soft blue light. Anime-style fantasy weapon.',
      'Key Item': 'A mysterious ancient artifact, a glowing orb or crystal with mysterious symbols. Important plot device.',
    },
  }

  return prompts[category]?.[slotTitle] || `A ${category} element: ${slotTitle}`
}

