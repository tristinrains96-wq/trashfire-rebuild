'use client'

export type ActivePanel = 'script' | 'characters' | 'backgrounds' | 'voices' | 'scenes' | 'episode'
export type StylePack = 'naruto_like' | 'jjk_like' | 'ghibli_like' | 'dbz_like' | 'demon_like'
export type Intent = 'make_script' | 'gen_characters' | 'gen_backgrounds' | 'assign_voices' | 'build_scenes' | 'make_episode' | 'set_style' | 'help'

export interface StudioState {
  activePanel: ActivePanel
  stylePack?: StylePack
  plan: {
    characters: any[]
    locations: any[]
    scenes: any[]
  }
}

export interface IntentResult {
  intent: Intent
  payload?: any
}

export interface Message {
  id: string
  role: 'user' | 'ai'
  text: string
  options?: Array<{
    label: string
    action: string
    payload?: any
  }>
}

export function getInitialState(): StudioState {
  return {
    activePanel: 'script',
    stylePack: undefined,
    plan: {
      characters: [],
      locations: [],
      scenes: []
    }
  }
}

export function detectIntent(text: string): IntentResult {
  const lowerText = text.toLowerCase()
  
  // Style detection first
  if (/(naruto|ninja|shinobi)/i.test(lowerText)) {
    return { intent: 'set_style', payload: { stylePack: 'naruto_like' } }
  }
  if (/(jujutsu|jjk|jujutsu kaisen)/i.test(lowerText)) {
    return { intent: 'set_style', payload: { stylePack: 'jjk_like' } }
  }
  if (/(ghibli|studio ghibli|spirited away|totoro)/i.test(lowerText)) {
    return { intent: 'set_style', payload: { stylePack: 'ghibli_like' } }
  }
  if (/(dragon ball|dbz|goku|vegeta)/i.test(lowerText)) {
    return { intent: 'set_style', payload: { stylePack: 'dbz_like' } }
  }
  if (/(demon slayer|kimetsu|tanjiro)/i.test(lowerText)) {
    return { intent: 'set_style', payload: { stylePack: 'demon_like' } }
  }
  
  // Intent detection
  if (/script|story|plot|write|episode|narrative/i.test(lowerText)) {
    return { intent: 'make_script' }
  }
  if (/character|hero|protagonist|like goku|like.*(naruto|goku|character)/i.test(lowerText)) {
    return { intent: 'gen_characters' }
  }
  if (/background|environment|dojo|city|mountain|location|setting/i.test(lowerText)) {
    return { intent: 'gen_backgrounds' }
  }
  if (/voice|speaking|narration|voice actor|voiceover/i.test(lowerText)) {
    return { intent: 'assign_voices' }
  }
  if (/scene|board|shot|camera|storyboard|sequence/i.test(lowerText)) {
    return { intent: 'build_scenes' }
  }
  if (/episode|render|export|final|output|video/i.test(lowerText)) {
    return { intent: 'make_episode' }
  }
  
  return { intent: 'help' }
}

export function stylePresetFor(text: string): StylePack | undefined {
  const lowerText = text.toLowerCase()
  
  if (/(naruto|ninja|shinobi)/i.test(lowerText)) return 'naruto_like'
  if (/(jujutsu|jjk|jujutsu kaisen)/i.test(lowerText)) return 'jjk_like'
  if (/(ghibli|studio ghibli|spirited away|totoro)/i.test(lowerText)) return 'ghibli_like'
  if (/(dragon ball|dbz|goku|vegeta)/i.test(lowerText)) return 'dbz_like'
  if (/(demon slayer|kimetsu|tanjiro)/i.test(lowerText)) return 'demon_like'
  
  return undefined
}

export function applyIntent(
  state: StudioState, 
  intentResult: IntentResult, 
  pushMessage: (message: Message) => void
): StudioState {
  const { intent, payload } = intentResult
  
  switch (intent) {
    case 'make_script':
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "I'll help draft the episode. Want me to detect characters?",
        options: [
          { label: 'Generate Characters', action: 'goto:characters' }
        ]
      })
      return { ...state, activePanel: 'script' }
      
    case 'gen_characters':
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "I'll set up your character studio.",
        options: [
          { label: 'Generate Master Sheet', action: 'generate:characters' }
        ]
      })
      return { ...state, activePanel: 'characters' }
      
    case 'gen_backgrounds':
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "Let's block your environments.",
        options: [
          { label: 'Generate Backgrounds', action: 'generate:backgrounds' }
        ]
      })
      return { ...state, activePanel: 'backgrounds' }
      
    case 'assign_voices':
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "Pick voices; I'll remember them per character.",
        options: [
          { label: 'Browse Voice Library', action: 'browse:voices' }
        ]
      })
      return { ...state, activePanel: 'voices' }
      
    case 'build_scenes':
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "We'll compose scenes from your plan.",
        options: [
          { label: 'Create Storyboard', action: 'create:storyboard' }
        ]
      })
      return { ...state, activePanel: 'scenes' }
      
    case 'make_episode':
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "Ready to preview & export.",
        options: [
          { label: 'Preview Episode', action: 'preview:episode' }
        ]
      })
      return { ...state, activePanel: 'episode' }
      
    case 'set_style':
      const stylePack = payload?.stylePack || stylePresetFor('')
      const styleLabels = {
        naruto_like: 'Naruto-like',
        jjk_like: 'Jujutsu Kaisen-like',
        ghibli_like: 'Studio Ghibli-like',
        dbz_like: 'Dragon Ball Z-like',
        demon_like: 'Demon Slayer-like'
      }
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: `Locked visual style: ${styleLabels[stylePack as StylePack] || stylePack}`,
        options: [
          { label: 'Continue with Style', action: 'continue:with_style' }
        ]
      })
      return { ...state, stylePack }
      
    case 'help':
    default:
      pushMessage({
        id: Date.now().toString(),
        role: 'ai',
        text: "Try: \"Create a ninja anime in Naruto style\" or \"Make a dojo background.\"",
        options: [
          { label: 'Start Script', action: 'goto:script' },
          { label: 'Create Characters', action: 'goto:characters' },
          { label: 'Design Backgrounds', action: 'goto:backgrounds' }
        ]
      })
      return state
  }
}
