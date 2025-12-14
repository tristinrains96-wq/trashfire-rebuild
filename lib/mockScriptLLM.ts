import { OutlineModel, BeatModel, SceneCardModel, ScriptLabState, Alert, NextAction } from '@/store/scriptLab'

export interface MockLLMResult {
  explainer: string
  outline?: OutlineModel
  beats?: BeatModel[]
  sceneCards?: SceneCardModel[]
  canonicalText?: string
  draft?: string
  alerts?: Alert[]
  nextActions?: NextAction[]
}

// Generate a unique ID
const generateId = () => Math.random().toString(36).substr(2, 9)

// Create alerts
const createAlert = (level: 'info' | 'warn' | 'block', msg: string, action?: { label: string; prompt: string }): Alert => ({
  id: generateId(),
  level,
  msg,
  action
})

// Create next actions
const createNextAction = (label: string, prompt: string): NextAction => ({
  label,
  prompt
})

// Create a default 3-act outline
const createDefaultOutline = (): OutlineModel => ({
  acts: [
    {
      title: "Act I: Setup",
      sequences: [
        {
          title: "Opening",
          scenes: [
            { id: generateId(), title: "The Call to Adventure", estSec: 45 },
            { id: generateId(), title: "Meet the Protagonist", estSec: 60 },
            { id: generateId(), title: "Inciting Incident", estSec: 30 }
          ]
        }
      ]
    },
    {
      title: "Act II: Confrontation",
      sequences: [
        {
          title: "Rising Action",
          scenes: [
            { id: generateId(), title: "First Obstacle", estSec: 90 },
            { id: generateId(), title: "Midpoint Crisis", estSec: 120 },
            { id: generateId(), title: "Darkest Hour", estSec: 60 }
          ]
        }
      ]
    },
    {
      title: "Act III: Resolution",
      sequences: [
        {
          title: "Climax & Resolution",
          scenes: [
            { id: generateId(), title: "Final Battle", estSec: 90 },
            { id: generateId(), title: "Resolution", estSec: 45 }
          ]
        }
      ]
    }
  ]
})

// Create Save the Cat beats
const createDefaultBeats = (): BeatModel[] => [
  { id: generateId(), label: "Opening Image", tSec: 0, note: "The hook that draws us in" },
  { id: generateId(), label: "Theme Stated", tSec: 30, note: "What the story is really about" },
  { id: generateId(), label: "Setup", tSec: 60, note: "Introduce the hero in their ordinary world" },
  { id: generateId(), label: "Catalyst", tSec: 120, note: "The inciting incident" },
  { id: generateId(), label: "Debate", tSec: 180, note: "Should I go on this journey?" },
  { id: generateId(), label: "Break into Two", tSec: 240, note: "Hero decides to act" },
  { id: generateId(), label: "B Story", tSec: 300, note: "Subplot begins" },
  { id: generateId(), label: "Fun and Games", tSec: 360, note: "The promise of the premise" },
  { id: generateId(), label: "Midpoint", tSec: 420, note: "False victory or defeat" },
  { id: generateId(), label: "Bad Guys Close In", tSec: 480, note: "Internal and external forces" },
  { id: generateId(), label: "All Is Lost", tSec: 540, note: "Darkest moment" },
  { id: generateId(), label: "Dark Night of the Soul", tSec: 600, note: "Hero hits rock bottom" },
  { id: generateId(), label: "Break into Three", tSec: 660, note: "Hero finds new way" },
  { id: generateId(), label: "Finale", tSec: 720, note: "Hero faces final challenge" },
  { id: generateId(), label: "Final Image", tSec: 780, note: "Opposite of opening image" }
]

// Create scene cards from outline
const createSceneCardsFromOutline = (outline: OutlineModel): SceneCardModel[] => {
  const cards: SceneCardModel[] = []
  const locations = ["School", "Rooftop", "Street", "Café", "Home", "Park"]
  const timeOfDays: Array<'Day' | 'Night' | 'Sunset'> = ['Day', 'Night', 'Sunset']
  const speakers = ["RIN", "DAICHI", "PRINCIPAL", "TEACHER", "FRIEND"]
  
  outline.acts.forEach((act, actIndex) => {
    act.sequences.forEach((sequence, seqIndex) => {
      sequence.scenes.forEach((scene, sceneIndex) => {
        cards.push({
          id: scene.id,
          title: scene.title,
          location: locations[Math.floor(Math.random() * locations.length)],
          timeOfDay: timeOfDays[Math.floor(Math.random() * timeOfDays.length)],
          speakers: speakers.slice(0, Math.floor(Math.random() * 3) + 1),
          estSec: scene.estSec
        })
      })
    })
  })
  
  return cards
}

// Generate canonical text from outline
const generateCanonicalText = (outline: OutlineModel): string => {
  let script = ""
  
  outline.acts.forEach((act, actIndex) => {
    script += `\n=== ${act.title} ===\n\n`
    
    act.sequences.forEach((sequence, seqIndex) => {
      script += `${sequence.title}:\n`
      
      sequence.scenes.forEach((scene, sceneIndex) => {
        script += `\n${scene.title} (${scene.estSec}s)\n`
        script += `[Scene description and dialogue would go here]\n`
      })
    })
  })
  
  return script.trim()
}

// Generate draft from outline and scene cards
const generateDraft = (outline: OutlineModel | null, sceneCards: SceneCardModel[]): string => {
  if (sceneCards.length > 0) {
    let draft = ""
    sceneCards.forEach((card, index) => {
      draft += `\nSCENE ${index + 1}: ${card.title}\n`
      draft += `LOCATION: ${card.location} (${card.timeOfDay})\n`
      draft += `CHARACTERS: ${card.speakers.join(', ')}\n`
      draft += `DURATION: ${card.estSec}s\n\n`
      
      // Add simple dialogue beats
      if (card.speakers.length > 0) {
        draft += `${card.speakers[0]}: [Opening line for this scene]\n`
        if (card.speakers.length > 1) {
          draft += `${card.speakers[1]}: [Response or conflict]\n`
        }
        draft += `\n[Scene continues with character development and plot progression]\n\n`
      }
    })
    return draft.trim()
  }
  
  if (outline) {
    let draft = ""
    outline.acts.forEach((act, actIndex) => {
      draft += `\n=== ${act.title} ===\n\n`
      act.sequences.forEach((sequence, seqIndex) => {
        sequence.scenes.forEach((scene, sceneIndex) => {
          draft += `SCENE: ${scene.title}\n`
          draft += `DURATION: ${scene.estSec}s\n`
          draft += `[Scene content with character dialogue and action]\n\n`
        })
      })
    })
    return draft.trim()
  }
  
  return ""
}

export async function mockLLM(userText: string, state: ScriptLabState): Promise<MockLLMResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
  
  const text = userText.toLowerCase()
  
  // Check for specific commands
  if (text.includes('outline') || text.includes('make outline') || text.includes('act')) {
    const outline = createDefaultOutline()
    const sceneCards = createSceneCardsFromOutline(outline)
    const draft = generateDraft(outline, sceneCards)
    
    const alerts: Alert[] = [
      createAlert('info', 'Episode length not set. Consider setting a target duration.', {
        label: 'Set length to 8 min',
        prompt: 'Set episode length to 8 minutes'
      }),
      createAlert('info', 'Main character goal not defined. This helps drive the story.', {
        label: 'Define MC goal',
        prompt: 'Define the main character goal for this story'
      })
    ]
    
    const nextActions: NextAction[] = [
      createNextAction('Make scene list', 'Make scene list'),
      createNextAction('Generate draft', 'Generate draft'),
      createNextAction('Add cold open', 'Add a cold open scene')
    ]
    
    return {
      explainer: "I've created a 3-act story structure with 8 scenes. Each act has sequences that build toward the climax. You can view the outline, beat sheet, or scene cards to see the breakdown.",
      outline,
      sceneCards,
      draft,
      alerts,
      nextActions
    }
  }
  
  if (text.includes('beats') || text.includes('beat sheet')) {
    const beats = createDefaultBeats()
    const nextActions: NextAction[] = [
      createNextAction('Generate draft', 'Generate draft'),
      createNextAction('Make scene list', 'Make scene list')
    ]
    
    return {
      explainer: "Here's your Save the Cat beat sheet with 15 key story moments. Each beat has a timestamp and note to guide your pacing.",
      beats,
      nextActions
    }
  }
  
  if (text.includes('scenes') || text.includes('scene list') || text.includes('scene cards')) {
    let outline = state.outline
    if (!outline) {
      outline = createDefaultOutline()
    }
    const sceneCards = createSceneCardsFromOutline(outline)
    const draft = generateDraft(outline, sceneCards)
    
    const alerts: Alert[] = [
      createAlert('warn', 'Location in Scene 3 is vague; add a clear place (e.g., "Shibuya rooftop").', {
        label: 'Fix location',
        prompt: 'Make Scene 3 location more specific'
      })
    ]
    
    const nextActions: NextAction[] = [
      createNextAction('Generate draft', 'Generate draft'),
      createNextAction('Tighten Act 2', 'Tighten Act 2'),
      createNextAction('Analyze & Map', 'Analyze & Map')
    ]
    
    return {
      explainer: "I've generated scene cards with locations, time of day, and speakers for each scene. This gives you a visual breakdown of your story.",
      sceneCards,
      outline: outline,
      draft,
      alerts,
      nextActions
    }
  }
  
  if (text.includes('shorter') || text.includes('shorten')) {
    if (state.outline) {
      const shortenedOutline = {
        ...state.outline,
        acts: state.outline.acts.map(act => ({
          ...act,
          sequences: act.sequences.map(seq => ({
            ...seq,
            scenes: seq.scenes.map(scene => ({
              ...scene,
              estSec: Math.max(15, Math.floor(scene.estSec * 0.8)) // Reduce by 20%, min 15s
            }))
          }))
        }))
      }
      
      const sceneCards = createSceneCardsFromOutline(shortenedOutline)
      const draft = generateDraft(shortenedOutline, sceneCards)
      
      const nextActions: NextAction[] = [
        createNextAction('Generate draft', 'Generate draft'),
        createNextAction('Analyze & Map', 'Analyze & Map')
      ]
      
      return {
        explainer: "I've shortened all scenes by 20% while keeping the story structure intact. This should help with pacing and runtime.",
        outline: shortenedOutline,
        sceneCards,
        draft,
        nextActions
      }
    }
    
    const alerts: Alert[] = [
      createAlert('block', 'No scenes yet. Ask me to "make a scene list".', {
        label: 'Make scene list',
        prompt: 'Make scene list'
      })
    ]
    
    return {
      explainer: "I'd be happy to shorten your script, but I need an outline first. Try asking me to 'make an outline' or 'create a 3-act structure'.",
      alerts
    }
  }
  
  if (text.includes('detect') || text.includes('entities')) {
    const characters = ["RIN", "DAICHI", "PRINCIPAL", "TEACHER", "FRIEND"]
    const locations = ["School", "Rooftop", "Street", "Café", "Home", "Park"]
    
    const nextActions: NextAction[] = [
      createNextAction('Analyze & Map', 'Analyze & Map'),
      createNextAction('Generate draft', 'Generate draft')
    ]
    
    return {
      explainer: `I've detected ${characters.length} characters and ${locations.length} locations in your script. Use 'Analyze & Map' to connect these to your existing assets.`,
      canonicalText: `Characters: ${characters.join(', ')}\nLocations: ${locations.join(', ')}`,
      nextActions
    }
  }
  
  if (text.includes('expand') || text.includes('detail')) {
    const nextActions: NextAction[] = [
      createNextAction('Generate draft', 'Generate draft'),
      createNextAction('Make scene list', 'Make scene list')
    ]
    
    return {
      explainer: "I can help expand specific scenes with more conflict, character development, or plot details. Which scene would you like me to work on?",
      nextActions
    }
  }
  
  if (text.includes('refine') || text.includes('stakes')) {
    const nextActions: NextAction[] = [
      createNextAction('Generate draft', 'Generate draft'),
      createNextAction('Tighten Act 2', 'Tighten Act 2')
    ]
    
    return {
      explainer: "I can help raise the stakes in your story. This might involve adding more conflict, increasing consequences, or deepening character motivations. What aspect would you like to focus on?",
      nextActions
    }
  }
  
  // Default response - create starter content if none exists
  if (!state.outline && !state.beats.length && !state.sceneCards.length) {
    const outline = createDefaultOutline()
    const sceneCards = createSceneCardsFromOutline(outline)
    const draft = generateDraft(outline, sceneCards)
    
    const alerts: Alert[] = [
      createAlert('info', 'Episode length not set. Consider setting a target duration.', {
        label: 'Set length to 8 min',
        prompt: 'Set episode length to 8 minutes'
      }),
      createAlert('info', 'Main character goal not defined. This helps drive the story.', {
        label: 'Define MC goal',
        prompt: 'Define the main character goal for this story'
      })
    ]
    
    const nextActions: NextAction[] = [
      createNextAction('Make scene list', 'Make scene list'),
      createNextAction('Generate draft', 'Generate draft'),
      createNextAction('Add cold open', 'Add a cold open scene')
    ]
    
    return {
      explainer: "Welcome to Script Lab! I can help you create outlines, beat sheets, and scene cards. Try asking me to 'make a 3-act outline' or 'create a beat sheet' to get started.",
      outline,
      sceneCards,
      draft,
      alerts,
      nextActions
    }
  }
  
  // Generic helpful response
  const nextActions: NextAction[] = [
    createNextAction('Make outline', 'Make outline'),
    createNextAction('Generate draft', 'Generate draft'),
    createNextAction('Make scene list', 'Make scene list')
  ]
  
  return {
    explainer: "I'm here to help with your script! I can create outlines, beat sheets, scene cards, and more. What would you like to work on?",
    nextActions
  }
}
