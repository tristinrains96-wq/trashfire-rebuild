/**
 * Episode Generation Prompt Templates
 * Four-pass system: Pass A (Structure) → Pass B (Screenplay) → Pass C (Punch-up) → Pass D (QA/Production JSON)
 */

export type StylePreset = 'shonen' | 'ghibli' | 'seinen' | 'slice-of-life'

const STYLE_DESCRIPTIONS: Record<StylePreset, string> = {
  shonen: 'Shonen anime style: action-packed, energetic, character growth, friendship themes, dynamic battles',
  ghibli: 'Studio Ghibli style: whimsical, nature-focused, emotional depth, beautiful animation, slice-of-life moments',
  seinen: 'Seinen anime style: mature themes, complex characters, psychological depth, realistic dialogue',
  'slice-of-life': 'Slice-of-life anime style: everyday moments, character interactions, gentle pacing, relatable situations',
}

/**
 * Episode Settings Interface
 */
export interface EpisodeSettings {
  length?: number // Target length in minutes (5-15)
  style?: StylePreset
  humor?: number // 0-100 slider
  tsundere?: number // 0-100 slider
}

/**
 * Pass A: Structure (800-1500 tokens)
 * Fast structure generation - sub-second target
 */
export function generateStructurePrompt(
  idea: string,
  settings?: EpisodeSettings
): string {
  const styleContext = settings?.style ? STYLE_DESCRIPTIONS[settings.style] : 'anime'
  const targetLength = settings?.length || 10 // Default 10 minutes
  const lengthNote = `Target duration: ${targetLength} minutes`
  
  return `You are an expert anime scriptwriter. Create a concise episode structure in ${styleContext} style.

Episode Idea: "${idea}"
${lengthNote}

Generate a JSON object with this exact structure (800-1500 tokens):
{
  "title": "Episode title (catchy, 5-10 words)",
  "logline": "One-sentence summary (15-25 words)",
  "summary": "Brief episode summary (50-100 words)",
  "act_structure": {
    "act_1": "Opening act (setup, ~${Math.floor(targetLength * 0.2)} min)",
    "act_2": "Middle act (development, ~${Math.floor(targetLength * 0.6)} min)",
    "act_3": "Final act (climax/resolution, ~${Math.floor(targetLength * 0.2)} min)"
  },
  "beats": [
    {
      "title": "Beat name",
      "description": "What happens (1-2 sentences)",
      "estimated_duration_seconds": ${Math.floor(targetLength * 60 / 5)}
    }
  ]
}

Requirements:
- Total duration: ${targetLength} minutes (±1 min)
- Include 3-5 key beats
- Style: ${styleContext}
- Return ONLY valid JSON, no markdown, no code blocks`
}

/**
 * Pass B: Screenplay (3000-8000 tokens)
 * Full screenplay with scenes and dialogue
 */
export function generateScreenplayPrompt(
  structure: any,
  settings?: EpisodeSettings
): string {
  const styleContext = settings?.style ? STYLE_DESCRIPTIONS[settings.style] : 'anime'
  const structureStr = JSON.stringify(structure, null, 2)
  
  return `You are an expert anime screenplay writer. Write the full screenplay based on this structure.

Episode Structure:
${structureStr}

Style: ${styleContext}

Generate a JSON object with this exact structure (3000-8000 tokens):
{
  "screenplay": {
    "scenes": [
      {
        "scene_number": 1,
        "scene_title": "Scene title",
        "description": "Visual description (2-3 sentences)",
        "location": "Location name",
        "time_of_day": "morning/afternoon/evening/night",
        "dialogue": [
          {
            "character": "Character name",
            "line": "Spoken dialogue",
            "emotion": "neutral/happy/sad/angry/excited",
            "action": "Optional action"
          }
        ],
        "narration": "Optional narrator line",
        "estimated_duration_seconds": 90
      }
    ],
    "characters": [
      {
        "name": "Character name",
        "description": "Physical and personality description",
        "role": "protagonist/antagonist/supporting",
        "voice_style": "Voice description"
      }
    ]
  }
}

Requirements:
- Write full screenplay with dialogue
- Each scene: 3-10 dialogue lines
- Character-consistent dialogue
- Style: ${styleContext}
- Return ONLY valid JSON, no markdown, no code blocks`
}

/**
 * Pass C: Punch-up (1500-4000 tokens)
 * Enhance dialogue, add humor/tsundere, refine character voices
 */
export function generatePunchUpPrompt(
  structure: any,
  screenplay: any,
  settings?: EpisodeSettings
): string {
  const styleContext = settings?.style ? STYLE_DESCRIPTIONS[settings.style] : 'anime'
  const humorLevel = settings?.humor || 0
  const tsundereLevel = settings?.tsundere || 0
  const structureStr = JSON.stringify(structure, null, 2)
  const screenplayStr = JSON.stringify(screenplay, null, 2)
  
  const humorNote = humorLevel > 50 
    ? `- Include humor and comedic moments (level: ${humorLevel}%)`
    : ''
  
  const tsundereNote = tsundereLevel > 50
    ? `- Include tsundere character archetypes (level: ${tsundereLevel}%)`
    : ''
  
  return `You are an expert anime dialogue editor. Punch up and refine this screenplay.

Episode Structure:
${structureStr}

Current Screenplay:
${screenplayStr}

Style: ${styleContext}
${humorNote}
${tsundereNote}

Generate an enhanced JSON object (1500-4000 tokens) with the same structure as the screenplay, but with:
- More natural, character-consistent dialogue
- Enhanced emotional beats
- Better pacing and flow
- ${humorNote ? 'Humor integrated naturally' : ''}
- ${tsundereNote ? 'Tsundere character moments' : ''}

Return ONLY valid JSON matching the screenplay structure, no markdown, no code blocks`
}

/**
 * Pass D: QA/Production JSON (800-1500 tokens)
 * Final production-ready JSON with all assets, locations, props, shot references
 */
export function generateProductionJsonPrompt(
  structure: any,
  screenplay: any,
  settings?: EpisodeSettings
): string {
  const styleContext = settings?.style ? STYLE_DESCRIPTIONS[settings.style] : 'anime'
  const structureStr = JSON.stringify(structure, null, 2)
  const screenplayStr = JSON.stringify(screenplay, null, 2)
  
  return `You are an expert anime production coordinator. Create the final production-ready JSON.

Episode Structure:
${structureStr}

Screenplay:
${screenplayStr}

Style: ${styleContext}

Generate a JSON object with this exact structure (800-1500 tokens):
{
  "episode_title": "Episode title",
  "logline": "One-sentence summary",
  "characters": [
    {
      "name": "Character name",
      "description": "Detailed physical and personality description for asset generation",
      "role": "protagonist/antagonist/supporting",
      "voice_style": "Voice description",
      "personality": "Personality traits"
    }
  ],
  "locations": [
    {
      "name": "Location name",
      "description": "Detailed location description for asset generation",
      "type": "indoor/outdoor/fantasy/urban/natural",
      "time_of_day": "morning/afternoon/evening/night"
    }
  ],
  "props": [
    {
      "name": "Prop name",
      "description": "Detailed prop description for asset generation",
      "purpose": "weapon/key item/decoration/etc"
    }
  ],
  "scenes": [
    {
      "scene_number": 1,
      "scene_title": "Scene title",
      "description": "Scene description",
      "location_id": "Location name",
      "characters_involved": ["Character name"],
      "props_used": ["Prop name"],
      "shot_references": [
        {
          "shot_type": "establishing/close-up/medium/wide/overhead",
          "camera_angle": "Optional camera angle",
          "emotion": "emotion to convey",
          "description": "Shot description"
        }
      ],
      "dialogue": [
        {
          "character": "Character name",
          "line": "Dialogue line",
          "emotion": "emotion",
          "action": "Optional action"
        }
      ],
      "estimated_duration_seconds": 90
    }
  ]
}

Requirements:
- All characters, locations, props must have detailed descriptions for asset generation
- Shot references should include camera angles and emotions
- Ensure all scene references match (location_id matches locations, characters_involved matches characters)
- Style: ${styleContext}
- Return ONLY valid JSON, no markdown, no code blocks`
}

/**
 * Legacy: Pass A (Outline) - kept for backward compatibility
 */
export function generateOutlinePrompt(
  idea: string,
  style?: StylePreset
): string {
  const styleContext = style ? STYLE_DESCRIPTIONS[style] : 'anime'
  
  return `You are an expert anime scriptwriter. Create a detailed episode outline in ${styleContext} style.

Episode Idea: "${idea}"

Generate a JSON object with this exact structure:
{
  "title": "Episode title (catchy, 5-10 words)",
  "logline": "One-sentence summary of the episode (15-25 words)",
  "summary": "2-3 paragraph episode summary (100-200 words)",
  "act_structure": {
    "act_1": "Opening act description (setup, 2-3 minutes)",
    "act_2": "Middle act description (development, 3-5 minutes)",
    "act_3": "Final act description (climax/resolution, 2-3 minutes)"
  },
  "beats": [
    {
      "title": "Beat name",
      "description": "What happens in this beat",
      "estimated_duration_seconds": 60
    }
  ]
}

Requirements:
- Total episode duration: 5-15 minutes
- Include 3-5 key story beats
- Each beat should have clear purpose (character development, plot advancement, emotional moment)
- Style: ${styleContext}
- Return ONLY valid JSON, no markdown, no code blocks, no explanations`
}

/**
 * Pass B: Scene Breakdown
 * Creates scene cards with visual descriptions and asset prompts
 */
export function generateSceneBreakdownPrompt(
  outline: any,
  style?: StylePreset
): string {
  const styleContext = style ? STYLE_DESCRIPTIONS[style] : 'anime'
  const outlineStr = JSON.stringify(outline, null, 2)
  
  return `You are an expert anime storyboard artist. Break down this episode outline into detailed scenes.

Episode Outline:
${outlineStr}

Style: ${styleContext}

Generate a JSON object with this exact structure:
{
  "scenes": [
    {
      "scene_number": 1,
      "title": "Scene title",
      "description": "Detailed visual description of what happens (2-3 sentences)",
      "estimated_duration_seconds": 90,
      "visual_style": "Description of visual mood, lighting, camera angles",
      "asset_prompts": [
        "Character prompt: [detailed description for character generation]",
        "Location prompt: [detailed description for location/background]"
      ],
      "key_moments": ["Moment 1", "Moment 2"]
    }
  ]
}

Requirements:
- Create 3-8 scenes that cover the full episode
- Each scene should have 1-3 asset prompts (characters, locations)
- Asset prompts should be detailed enough for image/video generation
- Visual style should match ${styleContext}
- Total duration should match outline (5-15 minutes)
- Return ONLY valid JSON, no markdown, no code blocks, no explanations`
}

/**
 * Pass C: Dialogue Punch-Up
 * Full script with character-consistent voices, humor/tsundere if selected
 */
export function generateDialoguePrompt(
  outline: any,
  scenes: any[],
  style?: StylePreset,
  humorLevel?: number, // 0-100 slider
  tsundereLevel?: number // 0-100 slider
): string {
  const styleContext = style ? STYLE_DESCRIPTIONS[style] : 'anime'
  const outlineStr = JSON.stringify(outline, null, 2)
  const scenesStr = JSON.stringify(scenes, null, 2)
  
  const humorNote = humorLevel && humorLevel > 50 
    ? `Include light humor and comedic moments (level: ${humorLevel}%)`
    : ''
  
  const tsundereNote = tsundereLevel && tsundereLevel > 50
    ? `Include tsundere character archetypes (level: ${tsundereLevel}%)`
    : ''
  
  return `You are an expert anime dialogue writer. Write the full script with character-consistent dialogue.

Episode Outline:
${outlineStr}

Scene Breakdown:
${scenesStr}

Style: ${styleContext}
${humorNote ? `- ${humorNote}` : ''}
${tsundereNote ? `- ${tsundereNote}` : ''}

Generate a JSON object with this exact structure:
{
  "script": {
    "scenes": [
      {
        "scene_number": 1,
        "scene_title": "Scene title",
        "location": "Location name",
        "time_of_day": "morning/afternoon/evening/night",
        "dialogue": [
          {
            "character": "Character name",
            "line": "Spoken dialogue",
            "emotion": "neutral/happy/sad/angry/excited/etc",
            "action": "Optional action description (e.g., 'looks away', 'smiles')"
          }
        ],
        "narration": "Optional narrator line",
        "sound_effects": ["Optional sound effect names"],
        "music_cue": "Optional music description"
      }
    ],
    "characters": [
      {
        "name": "Character name",
        "voice_style": "Description of voice (e.g., 'energetic young male', 'calm mature female')",
        "personality": "Brief personality description"
      }
    ]
  }
}

Requirements:
- Write natural, character-consistent dialogue
- Each scene should have 3-10 dialogue lines
- Include character actions and emotions
- Match the visual descriptions from scenes
- Style: ${styleContext}
${humorNote ? `- ${humorNote}` : ''}
${tsundereNote ? `- ${tsundereNote}` : ''}
- Return ONLY valid JSON, no markdown, no code blocks, no explanations`
}

